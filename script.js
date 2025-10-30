// app.js
// IPTV App — supports Safe and NSFW playlists.
// Twin Protocol version.

const M3U_SAFE = 'https://iptv-org.github.io/iptv/index.m3u';
const M3U_NSFW = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';

// DOM
const status = document.getElementById('status');
const channelsGrid = document.getElementById('channelsGrid');
const countryList = document.getElementById('countryList');
const countrySelect = document.getElementById('countrySelect');
const searchInput = document.getElementById('search');
const nowPlaying = document.getElementById('nowPlaying');
const notice = document.getElementById('notice');
const video = document.getElementById('video');
const btnMute = document.getElementById('btnMute');
const btnFullscreen = document.getElementById('btnFullscreen');

let allChannels = [];
let grouped = {};
let currentHls = null;

// === CONTENT FILTER ===
const filterContainer = document.createElement('div');
filterContainer.className = 'controls';
filterContainer.innerHTML = `
  <label style="font-size:13px;color:var(--muted)">
    Content:
    <select id="contentMode">
      <option value="safe" selected>Safe</option>
      <option value="nsfw">NSFW</option>
      <option value="both">Both</option>
    </select>
  </label>
`;
document.querySelector('.controls').appendChild(filterContainer);
const contentMode = document.getElementById('contentMode');

// helpers
function setStatus(t){ status.textContent = t; }
function safeText(s){ return (s||'').toString(); }

// === Parsing ===
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const channels = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')){
      const info = line;
      let streamUrl = '';
      for (let j=i+1;j<lines.length;j++){
        const L = lines[j].trim();
        if (!L) continue;
        if (L.startsWith('#')) continue;
        streamUrl = L;
        break;
      }
      const titleMatch = info.split(',')[1] || '';
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9\-_]+)="([^"]*)"/g;
      let m;
      while ((m = attrRegex.exec(info)) !== null){
        attrs[m[1]] = m[2];
      }
      const name = (titleMatch || attrs['tvg-name'] || attrs['title'] || 'Unknown').trim();
      const country = attrs['tvg-country'] || attrs['group-title'] || 'Other';
      const logo = attrs['tvg-logo'] || '';
      channels.push({
        name, country, logo,
        _url: streamUrl
      });
    }
  }
  return channels;
}

function groupByCountry(channels){
  const map = {};
  for (const ch of channels){
    const c = ch.country || 'Other';
    if (!map[c]) map[c] = [];
    map[c].push(ch);
  }
  const ordered = Object.keys(map).sort((a,b)=>{
    if (a==='Other') return 1;
    if (b==='Other') return -1;
    return a.localeCompare(b);
  }).reduce((acc,k)=>{ acc[k]=map[k]; return acc; }, {});
  return ordered;
}

// === UI rendering ===
function renderCountryList(grouped){
  countryList.innerHTML = '';
  countrySelect.innerHTML = '';
  const def = document.createElement('option');
  def.value = ''; def.textContent = 'All countries';
  countrySelect.appendChild(def);

  Object.entries(grouped).forEach(([country, arr])=>{
    const div = document.createElement('div');
    div.className = 'country-item';
    div.dataset.country = country;
    div.innerHTML = `<span>${country}</span><small style="opacity:.7">${arr.length}</small>`;
    div.addEventListener('click', ()=>{
      document.querySelectorAll('.country-item').forEach(e=>e.classList.remove('active'));
      div.classList.add('active');
      countrySelect.value = country;
      filterAndShow();
    });
    countryList.appendChild(div);

    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = `${country} (${arr.length})`;
    countrySelect.appendChild(opt);
  });
}

function renderChannels(channels){
  channelsGrid.innerHTML = '';
  if (!channels || channels.length===0){
    channelsGrid.innerHTML = `<div style="color:var(--muted);padding:16px">No channels found.</div>`;
    return;
  }
  for (const ch of channels){
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.title = ch.name;
    card.innerHTML = `
      <div class="channel-logo">${ch.logo ? `<img loading="lazy" alt="${ch.name}" src="${ch.logo}">` : '<svg width="64" height="40"><rect width="64" height="40" rx="6" fill="#0b0b12"/></svg>'}</div>
      <div class="channel-meta">
        <div class="channel-name">${escapeHtml(ch.name)}</div>
        <div class="channel-sub">${escapeHtml(ch.country)}</div>
      </div>
    `;
    card.addEventListener('click', ()=> playChannel(ch));
    channelsGrid.appendChild(card);
  }
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// === Filters & Search ===
function filterAndShow(){
  const q = (searchInput.value||'').toLowerCase().trim();
  const country = countrySelect.value;
  let list = allChannels.slice();
  if (country) list = list.filter(c=> (c.country||'').toLowerCase() === country.toLowerCase());
  if (q) list = list.filter(c=> (c.name||'').toLowerCase().includes(q));
  renderChannels(list);
}

// === Playback ===
function playChannel(ch){
  nowPlaying.textContent = `${ch.name} — ${ch.country}`;
  notice.textContent = '';
  if (currentHls){ try{currentHls.destroy();}catch{} currentHls=null; }
  const url = ch._url;
  if (video.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    video.src = url;
    video.play().catch(()=>{ notice.textContent='Click to start playback.'; });
  }else if (window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.loadSource(url);
    currentHls.attachMedia(video);
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> video.play().catch(()=>{ notice.textContent='Click to play.'; }));
    currentHls.on(Hls.Events.ERROR,(e,data)=>{
      if (data && /network|manifest|frag/.test(data.details))
        notice.textContent = 'Cannot play (CORS or host blocked).';
    });
  }else{
    video.src = url;
    video.play().catch(()=>{ notice.textContent='Browser cannot play this stream.'; });
  }
}

// === Controls ===
btnMute.addEventListener('click',()=>{ video.muted=!video.muted; btnMute.textContent=video.muted?'🔇':'🔊'; });
btnFullscreen.addEventListener('click',()=>{ if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(()=>{}); });
searchInput.addEventListener('input',()=> filterAndShow());
countrySelect.addEventListener('change',()=> filterAndShow());
contentMode.addEventListener('change',()=> boot()); // reload playlists

// === Loader ===
async function fetchPlaylist(url){
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

async function boot(){
  try{
    setStatus('Fetching playlists...');
    channelsGrid.innerHTML = '';
    const mode = contentMode.value;

    let textSafe = '', textNsfw = '';
    if (mode==='safe' || mode==='both') textSafe = await fetchPlaylist(M3U_SAFE);
    if (mode==='nsfw' || mode==='both') textNsfw = await fetchPlaylist(M3U_NSFW);

    const safeCh = textSafe ? parseM3U(textSafe) : [];
    const nsfwCh = textNsfw ? parseM3U(textNsfw) : [];

    allChannels = [...safeCh, ...nsfwCh];
    grouped = groupByCountry(allChannels);

    setStatus(`Loaded ${allChannels.length} channels (${mode.toUpperCase()})`);
    renderCountryList(grouped);
    renderChannels(allChannels);
  }catch(e){
    console.error(e);
    setStatus('Failed to load playlists.');
    notice.textContent = 'If blocked by CORS, run locally via a small HTTP server.';
  }
}

boot();
window.__IPTV = {boot,parseM3U,groupByCountry};
