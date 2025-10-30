// app.js — Twin Protocol final
// Cyberpunk UI + robust multi-proxy loader + internal HLS playback
// No raw URLs are displayed in the UI.

const PLAYLIST_SAFE = 'https://iptv-org.github.io/iptv/index.m3u';
const PLAYLIST_NSFW = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';

// Proxy fallbacks (tried in order). This increases chance the playlist loads.
const PROXIES = [
  (u)=>u, // direct
  (u)=>`https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`, // jina.ai proxy
  (u)=>`https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`, // duplicate intentional (some envs)
  (u)=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u)=>`https://thingproxy.freeboard.io/fetch/${u}`,
  (u)=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
];

// DOM
const statusEl = document.getElementById('status');
const channelsGrid = document.getElementById('channelsGrid');
const countryList = document.getElementById('countryList');
const countrySelect = document.getElementById('countrySelect');
const contentModeEl = document.getElementById('contentMode');
const searchInput = document.getElementById('search');
const nowPlaying = document.getElementById('nowPlaying');
const notice = document.getElementById('notice');

const video = document.getElementById('video');
const btnMute = document.getElementById('btnMute');
const btnFullscreen = document.getElementById('btnFullscreen');

let allChannels = [];
let grouped = {};
let currentHls = null;

// Small helper
function setStatus(text){ statusEl.textContent = text || ''; }
function setNotice(text){ if(notice) notice.textContent = text || ''; }

// Try multiple proxy endpoints until one returns text
async function fetchWithProxies(url, timeout = 15000){
  let lastErr = null;
  for (const makeUrl of PROXIES){
    const target = makeUrl(url);
    try{
      setStatus(`Fetching playlist (${shortName(target)})`);
      const controller = new AbortController();
      const id = setTimeout(()=>controller.abort(), timeout);
      const res = await fetch(target, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      // quick sanity: must contain "#EXTINF"
      if (text && text.includes('#EXTINF')) return text;
      else throw new Error('no EXTINF in response');
    }catch(err){
      lastErr = err;
      console.warn('proxy failed', target, err);
      // try next
    }
  }
  throw lastErr;
}
function shortName(u){ try { const o=new URL(u); return o.hostname; } catch(e){ return u.slice(0,40); } }

// Parse M3U - returns channels array with internal _url
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const channels = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')){
      const info = line;
      let streamUrl = '';
      // find next non-empty non-comment line
      for (let j=i+1;j<lines.length;j++){
        const L = lines[j].trim();
        if (!L) continue;
        if (L.startsWith('#')) continue;
        streamUrl = L;
        break;
      }
      const title = (info.split(',').slice(1).join(',') || '').trim();
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9\-_]+)="([^"]*)"/g;
      let m;
      while ((m = attrRegex.exec(info)) !== null){
        attrs[m[1]] = m[2];
      }
      const name = (title || attrs['tvg-name'] || attrs['title'] || 'Unknown Channel').trim();
      const country = attrs['tvg-country'] || attrs['group-title'] || 'Other';
      const logo = attrs['tvg-logo'] || '';
      channels.push({ name, country, logo, _url: streamUrl });
    }
  }
  return channels;
}

// Group and render
function groupByCountry(channels){
  const map = {};
  channels.forEach(ch => {
    const c = ch.country || 'Other';
    (map[c] = map[c] || []).push(ch);
  });
  // order keys with Other last
  const keys = Object.keys(map).sort((a,b)=>{
    if (a==='Other') return 1;
    if (b==='Other') return -1;
    return a.localeCompare(b);
  });
  const ordered = {};
  for (const k of keys) ordered[k] = map[k];
  return ordered;
}

function renderCountryList(obj){
  countryList.innerHTML = '';
  countrySelect.innerHTML = '<option value="">All countries</option>';
  Object.entries(obj).forEach(([country, arr])=>{
    const div = document.createElement('div');
    div.className = 'country-item';
    div.dataset.country = country;
    div.innerHTML = `<span>${escapeHtml(country)}</span><small style="opacity:.7">${arr.length}</small>`;
    div.addEventListener('click', ()=>{
      document.querySelectorAll('.country-item').forEach(e=>e.classList.remove('active'));
      div.classList.add('active');
      countrySelect.value = country;
      applyFilters();
    });
    countryList.appendChild(div);

    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = `${country} (${arr.length})`;
    countrySelect.appendChild(opt);
  });
}

function renderChannels(list){
  const grid = channelsGrid;
  grid.innerHTML = '';
  if (!list || list.length===0){
    grid.innerHTML = `<div style="color:var(--muted);padding:18px">No channels found.</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const ch of list){
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.title = ch.name;
    const logoHtml = ch.logo ? `<img loading="lazy" alt="${escapeHtml(ch.name)}" src="${escapeHtml(ch.logo)}">` : '<svg width="72" height="44" viewBox="0 0 72 44" xmlns="http://www.w3.org/2000/svg"><rect width="72" height="44" rx="6" fill="#0b0b12"/></svg>';
    card.innerHTML = `
      <div class="channel-logo">${logoHtml}</div>
      <div class="channel-meta">
        <div class="channel-name">${escapeHtml(ch.name)}</div>
        <div class="channel-sub">${escapeHtml(ch.country)}</div>
      </div>
    `;
    card.addEventListener('click', ()=> playChannel(ch));
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Filters
let searchTimer = null;
searchInput.addEventListener('input', ()=>{
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(()=> applyFilters(), 160);
});
countrySelect.addEventListener('change', ()=> applyFilters());
contentModeEl.addEventListener('change', ()=> loadPlaylists());

function applyFilters(){
  const q = (searchInput.value||'').toLowerCase().trim();
  const country = countrySelect.value;
  let list = allChannels.slice();
  if (country) list = list.filter(c=> (c.country||'').toLowerCase() === country.toLowerCase());
  if (q) list = list.filter(c=> (c.name||'').toLowerCase().includes(q) || (c.country||'').toLowerCase().includes(q));
  renderChannels(list);
}

// Playback (internal)
function teardownHls(){
  if (currentHls){
    try{ currentHls.stopLoad(); currentHls.destroy(); } catch(e){ console.warn(e); }
    currentHls = null;
  }
  try{ video.pause(); video.removeAttribute('src'); video.load(); } catch(e){}
}

function playChannel(ch){
  nowPlaying.textContent = `${ch.name} — ${ch.country}`;
  setNotice('');
  teardownHls();

  const url = ch._url;
  if (!url){ setNotice('No stream URL'); return; }

  // prefer native (Safari) else Hls.js
  if (video.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    video.src = url;
    video.play().catch(()=> setNotice('Click the video to start playback.'));
    return;
  }
  if (window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.on(Hls.Events.ERROR, (evt, data)=> {
      console.warn('HLS ERROR', data);
      if (data && data.type === Hls.ErrorTypes.NETWORK_ERROR) setNotice('Network/host blocked playback (CORS or 403).');
      if (data && data.fatal) currentHls.destroy();
    });
    currentHls.attachMedia(video);
    try {
      currentHls.loadSource(url);
    } catch(e){
      console.error(e); setNotice('Failed to load stream.');
    }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> {
      video.play().catch(()=> setNotice('Click to start.'));
    });
    return;
  }
  // fallback
  video.src = url;
  video.play().catch(()=> setNotice('Playback blocked—click to play.'));
}

// UI Buttons
btnMute.addEventListener('click', ()=> {
  video.muted = !video.muted;
  btnMute.textContent = video.muted ? '🔇' : '🔊';
});
btnFullscreen.addEventListener('click', ()=> {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(()=>{});
});

// Load playlists (tries proxies)
async function loadPlaylists(){
  try{
    setStatus('Loading playlists…');
    setNotice('');
    channelsGrid.innerHTML = '';
    allChannels = [];

    const mode = contentModeEl.value || 'both';
    let textSafe = '', textNsfw = '';

    if (mode === 'safe' || mode === 'both'){
      try { textSafe = await fetchWithProxies(PLAYLIST_SAFE); } catch(e){ console.warn('safe failed', e); }
    }
    if (mode === 'nsfw' || mode === 'both'){
      try { textNsfw = await fetchWithProxies(PLAYLIST_NSFW); } catch(e){ console.warn('nsfw failed', e); }
    }

    const safeCh = textSafe ? parseM3U(textSafe) : [];
    const nsfwCh = textNsfw ? parseM3U(textNsfw) : [];

    allChannels = [...safeCh, ...nsfwCh];

    if (!allChannels.length){
      setStatus('No channels loaded');
      setNotice('Could not fetch playlists — try running a local static server or check your network.');
      group = {};
      renderCountryList({});
      renderChannels([]);
      return;
    }

    grouped = groupByCountry(allChannels);
    renderCountryList(grouped);
    renderChannels(allChannels);
    setStatus(`Loaded ${allChannels.length} channels`);
  }catch(e){
    console.error('loadPlaylists error', e);
    setStatus('Error loading playlists');
    setNotice('Network or proxy error. Try running a local server: python -m http.server');
  }
}

// init
loadPlaylists();

// expose for quick debugging (safe)
window.__IPTV = {
  reload: loadPlaylists,
  channels: ()=>allChannels.length
};
