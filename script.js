/* script.js — Anime-only app (animation.m3u)
   - Loads animation.m3u automatically (with proxy fallback)
   - Grid of channels, search, theme selector (dark/grey/light)
   - Plays with hls.js fallback
   - No external category loading (single playlist)
*/

// ---- CONFIG ----
const PLAYLIST_URL = "https://iptv-org.github.io/iptv/categories/animation.m3u";
const MAX_CHANNELS = 800; // safe upper limit
const FETCH_TIMEOUT = 20000; // ms

// proxies to try (hosted mode optimized)
const PROXIES = [
  u => u,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  u => `https://thingproxy.freeboard.io/fetch/${u}`,
  u => `https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`,
];

// DOM
const statusEl = document.getElementById('status');
const gridEl = document.getElementById('grid');
const searchInput = document.getElementById('search');
const themeSelect = document.getElementById('themeSelect');
const refreshBtn = document.getElementById('refreshBtn');

const playerModal = document.getElementById('playerModal');
const videoEl = document.getElementById('video');
const closePlayerBtn = document.getElementById('closePlayer');
const nowPlayingEl = document.getElementById('nowPlaying');
const playerNotice = document.getElementById('playerNotice');

let channels = [];
let currentHls = null;

// ---- UI helpers ----
function setStatus(t){ if(statusEl) statusEl.textContent = t; console.log('[anime] '+t); }
function showGrid(){ gridEl.classList.remove('hidden'); }
function hideGrid(){ gridEl.classList.add('hidden'); }

// theme
function applyTheme(name){
  document.documentElement.classList.remove('light','grey');
  if(name === 'light') document.documentElement.classList.add('light');
  if(name === 'grey') document.documentElement.classList.add('grey');
  try{ localStorage.setItem('anime_theme', name); }catch(e){}
}
themeSelect.addEventListener('change', ()=> applyTheme(themeSelect.value));
(function initTheme(){
  const saved = (localStorage.getItem('anime_theme') || 'dark');
  themeSelect.value = saved;
  applyTheme(saved);
})();

// safe image element with fallback
function imgWithFallback(src, fallback){
  const img = document.createElement('img');
  img.src = src || fallback;
  img.onerror = ()=> { if(fallback && img.src !== fallback) img.src = fallback; };
  return img;
}

// ---- fetch helpers ----
async function fetchTextWithTimeout(url, timeout=FETCH_TIMEOUT){
  const ctrl = new AbortController();
  const id = setTimeout(()=> ctrl.abort(), timeout);
  try{
    const res = await fetch(url, {signal: ctrl.signal, credentials:'omit'});
    clearTimeout(id);
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.text();
  } finally { clearTimeout(id); }
}

async function fetchWithFallback(url){
  let lastErr = null;
  for(const make of PROXIES){
    const u = make(url);
    try{
      setStatus('Fetching playlist (' + (u === url ? 'direct' : 'proxy') + ')');
      const txt = await fetchTextWithTimeout(u, FETCH_TIMEOUT);
      // sanity check
      if(txt && (txt.includes('#EXTINF') || txt.includes('#EXTM3U') || txt.length > 200)) return txt;
      throw new Error('Invalid playlist content');
    }catch(e){
      lastErr = e;
      console.warn('[anime] fetch failed for', u, e && e.message);
      // small delay before next attempt
      await new Promise(r=>setTimeout(r, 300));
    }
  }
  throw lastErr || new Error('All fetch attempts failed');
}

// parse M3U
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const out = [];
  let pending = null;
  for(let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if(!line) continue;
    if(line.startsWith('#EXTINF')){
      const logoM = line.match(/tvg-logo="([^"]+)"/i);
      const nameM = line.match(/,(.*)$/);
      pending = { name: nameM ? nameM[1].trim() : 'Unknown', logo: logoM ? logoM[1] : '' };
    } else if(!line.startsWith('#')){
      if(pending){
        pending.url = line;
        out.push(pending);
        pending = null;
      } else {
        out.push({ name: line, logo:'', url: line });
      }
    }
    if(out.length >= MAX_CHANNELS) break;
  }
  return out;
}

// ---- render ----
function renderChannels(list){
  gridEl.innerHTML = '';
  if(!list.length){
    setStatus('No channels found in playlist.');
    hideGrid();
    return;
  }
  setStatus(`Showing ${list.length} channels`);
  showGrid();
  list.forEach(ch => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = imgWithFallback(ch.logo, 'https://via.placeholder.com/320x180?text=Anime');
    card.appendChild(img);
    const p = document.createElement('p');
    p.textContent = ch.name;
    card.appendChild(p);
    card.addEventListener('click', ()=> playChannel(ch));
    gridEl.appendChild(card);
  });
}

// ---- search ----
searchInput.addEventListener('input', ()=> {
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.card').forEach(card=>{
    const txt = (card.querySelector('p')?.textContent || '').toLowerCase();
    card.style.display = q ? (txt.includes(q) ? 'block' : 'none') : 'block';
  });
});

// ---- playback ----
function teardownHls(){
  if(currentHls){ try{ currentHls.destroy(); }catch(e){} currentHls = null; }
  try{ videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); }catch(e){}
}
function playChannel(item){
  if(!item || !item.url){ playerNotice.textContent = 'No playable URL'; return; }
  nowPlayingEl.textContent = item.name;
  playerNotice.textContent = '';
  playerModal.classList.remove('hidden');
  teardownHls();
  const url = item.url;
  // native HLS
  if(videoEl.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    videoEl.src = url;
    videoEl.play().catch(()=> playerNotice.textContent = 'Tap to start');
    return;
  }
  if(window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.on(Hls.Events.ERROR, (evt,data)=> {
      console.warn('HLS error', data);
      if(data && data.fatal) currentHls.destroy();
      if(data && data.type === Hls.ErrorTypes.NETWORK_ERROR) playerNotice.textContent = 'Playback blocked by host (CORS/403).';
    });
    currentHls.attachMedia(videoEl);
    try{ currentHls.loadSource(url); }catch(e){ playerNotice.textContent = 'Failed to load stream.'; return; }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> videoEl.play().catch(()=> playerNotice.textContent = 'Tap to start'));
    return;
  }
  // fallback
  videoEl.src = url;
  videoEl.play().catch(()=> playerNotice.textContent = 'Playback blocked');
}
closePlayerBtn.addEventListener('click', ()=> {
  playerModal.classList.add('hidden');
  teardownHls();
});

// ---- load playlist ----
async function loadPlaylist(){
  setStatus('Loading playlist — attempting fetch...');
  gridEl.classList.add('hidden');
  try{
    const text = await fetchWithFallback(PLAYLIST_URL);
    setStatus('Parsing playlist…');
    channels = parseM3U(text);
    renderChannels(channels);
  }catch(e){
    console.error('[anime] playlist load failed', e);
    setStatus('Failed to load playlist. Try Refresh. ' + (e && e.message ? e.message : ''));
    gridEl.innerHTML = `<div style="color:#f66;padding:12px">Failed to load the playlist. If hosting on HTTPS, try again or use the Refresh button.</div>`;
    gridEl.classList.remove('hidden');
  }
}

// ---- refresh handler ----
refreshBtn.addEventListener('click', ()=> loadPlaylist());

// ---- init ----
(function init(){
  setStatus('Initializing…');
  // load theme already applied in HTML via script order
  const savedTheme = localStorage.getItem('anime_theme');
  if(savedTheme) { themeSelect.value = savedTheme; /* applyTheme handled in previous file if used */ }
  // load playlist
  loadPlaylist();
})();
