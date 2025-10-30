// app.js — final, local-proxy aware, grouped by country, internal HLS player
// Uses local proxy endpoint: /proxy?url=<encodedPlaylistURL>

const PLAYLIST_SAFE = 'https://iptv-org.github.io/iptv/index.m3u';
const PLAYLIST_NSFW = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';

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

// helpers
function setStatus(t){ statusEl.textContent = t || ''; }
function setNotice(t){ if (notice) notice.textContent = t || ''; }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// fetch via local proxy (guaranteed if proxy.py is running)
async function fetchPlaylist(url){
  // proxy endpoint served by proxy.py
  const prox = `/proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(prox);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// parse M3U into channel objects
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const channels = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')){
      const info = line;
      // next non-empty non-comment line is URL
      let streamUrl = '';
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

function groupByCountry(channels){
  const map = {};
  channels.forEach(ch => {
    const c = ch.country || 'Other';
    (map[c] = map[c] || []).push(ch);
  });
  const keys = Object.keys(map).sort((a,b)=>{
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });
  const ordered = {};
  for (const k of keys) ordered[k] = map[k];
  return ordered;
}

// render
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
  channelsGrid.innerHTML = '';
  if (!list || list.length === 0){
    channelsGrid.innerHTML = `<div style="color:var(--muted);padding:18px">No channels found.</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.title = ch.name;
    const logoHtml = ch.logo ? `<img loading="lazy" alt="${escapeHtml(ch.name)}" src="${escapeHtml(ch.logo)}">` : '<svg width="84" height="48" viewBox="0 0 84 48" xmlns="http://www.w3.org/2000/svg"><rect width="84" height="48" rx="6" fill="#0b0b12"/></svg>';
    card.innerHTML = `
      <div class="channel-logo">${logoHtml}</div>
      <div class="channel-meta">
        <div class="channel-name">${escapeHtml(ch.name)}</div>
        <div class="channel-sub">${escapeHtml(ch.country)}</div>
      </div>
    `;
    card.addEventListener('click', ()=> playChannel(ch));
    frag.appendChild(card);
  });
  channelsGrid.appendChild(frag);
}

// filters
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
  if (country) list = list.filter(c => (c.country||'').toLowerCase() === country.toLowerCase());
  if (q) list = list.filter(c => (c.name||'').toLowerCase().includes(q) || (c.country||'').toLowerCase().includes(q));
  renderChannels(list);
}

// playback (internal)
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
  if (!url){ setNotice('No stream URL available'); return; }

  // For Hls.js we need absolute playable URL. Many entries are http(s) HLS.
  if (video.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    video.src = url;
    video.play().catch(()=> setNotice('Click video to start playback'));
    return;
  }
  if (window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.on(Hls.Events.ERROR, (evt, data) => {
      console.warn('HLS ERROR', data);
      if (data && data.type === Hls.ErrorTypes.NETWORK_ERROR) setNotice('Host blocked playback (CORS/403). Try local server.');
      if (data && data.fatal) currentHls.destroy();
    });
    currentHls.attachMedia(video);
    try{
      currentHls.loadSource(url);
    }catch(e){
      console.error(e);
      setNotice('Failed to load stream.');
    }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> {
      video.play().catch(()=> setNotice('Click to start playback'));
    });
    return;
  }

  // fallback
  video.src = url;
  video.play().catch(()=> setNotice('Playback blocked by browser.'));
}

// UI buttons
btnMute.addEventListener('click', ()=> {
  video.muted = !video.muted;
  btnMute.textContent = video.muted ? '🔇' : '🔊';
  btnMute.setAttribute('aria-pressed', video.muted ? 'true' : 'false');
});
btnFullscreen.addEventListener('click', ()=> {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(()=>{});
});

// main loader — uses local proxy endpoint
async function loadPlaylists(){
  try{
    setStatus('Loading playlists...');
    setNotice('');
    channelsGrid.innerHTML = '';
    allChannels = [];

    const mode = contentModeEl.value || 'both';
    let safeText = '', nsfwText = '';

    if (mode === 'safe' || mode === 'both'){
      try { safeText = await fetchPlaylist(PLAYLIST_SAFE); } catch(e){ console.warn('safe fetch failed', e); }
    }
    if (mode === 'nsfw' || mode === 'both'){
      try { nsfwText = await fetchPlaylist(PLAYLIST_NSFW); } catch(e){ console.warn('nsfw fetch failed', e); }
    }

    const safeCh = safeText ? parseM3U(safeText) : [];
    const nsfwCh = nsfwText ? parseM3U(nsfwText) : [];

    allChannels = [...safeCh, ...nsfwCh];

    if (!allChannels.length){
      setStatus('No channels loaded');
      setNotice('Could not fetch playlists. Make sure proxy.py is running (python proxy.py) and open http://localhost:8000');
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
    setNotice('Network or proxy error. Run: python proxy.py');
  }
}

// init
loadPlaylists();

// small expose for debugging
window.__IPTV = {
  reload: loadPlaylists,
  channelsCount: ()=> allChannels.length
};
