/* script.js — Host-optimized robust loader for IPTV categories
   - Use when hosting (GitHub Pages / Netlify / your HTTPS host)
   - Tries direct fetch first, then rotates through multiple public proxies
   - Retries, timeouts, status messages for TV & mobile
   - Loads channels only when a category is clicked
   - Defensive M3U parsing (avoids crashes on malformed playlists)
   - HLS playback with hls.js fallback
*/

// ---------- CONFIG ----------
const MAX_CHANNELS_DISPLAY = 120;          // max channels to render per category
const CATEGORY_FETCH_TIMEOUT = 20000;     // ms per attempt
const ATTEMPTS_PER_PROXY = 2;             // how many attempts per proxy before moving on

// categories (keep the ones you gave; earlier you wanted renamed items included)
const categoriesData = [
  {name:"Auto", url:"https://iptv-org.github.io/iptv/categories/auto.m3u", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=60"},
  /* ... keep the rest of your categories here exactly as before ... */
  {name:"Special Interest", url:"https://iptv-org.github.io/iptv/categories/xxx.m3u", img:"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=60"},
  {name:"Miscellaneous", url:"https://iptv-org.github.io/iptv/categories/undefined.m3u", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60"}
];

// PROXIES (direct first, then reliable public relays). Hosted mode prefers direct.
// Note: public relays are fallbacks only. Rotate automatically.
const PROXIES = [
  u => u, // direct
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  u => `https://thingproxy.freeboard.io/fetch/${u}`,
  u => `https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`, // last-resort text mirror
];

// ---------- DOM ----------
const categoriesEl = document.getElementById('categories');
const channelsSection = document.getElementById('channelsSection');
const channelsEl = document.getElementById('channels');
const channelsTitle = document.getElementById('channelsTitle');
const channelsStatus = document.getElementById('channelsStatus');
const searchInput = document.getElementById('search');
const backBtn = document.getElementById('backBtn');
const refreshBtn = document.getElementById('refreshBtn');

const playerModal = document.getElementById('playerModal');
const videoEl = document.getElementById('video');
const closeBtn = document.getElementById('closePlayer') || document.querySelector('.closeBtn');
const nowPlayingEl = document.getElementById('nowPlaying');
const playerNotice = document.getElementById('playerNotice');

let lastLoadedCategory = null;
let currentHls = null;

// ---------- Helpers ----------
function safeImg(src, fallback){
  const img = document.createElement('img');
  img.src = src;
  img.onerror = () => { if (fallback && img.src !== fallback) img.src = fallback; };
  return img;
}

function setChannelsStatus(text){
  if(channelsStatus) channelsStatus.textContent = text;
  // also log for debug
  console.log('[IPTV] STATUS:', text);
}

function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

// Fetch text with timeout
async function fetchTextWithTimeout(url, timeoutMs){
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, {signal: controller.signal, credentials: 'omit'});
    clearTimeout(id);
    if(!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(id);
  }
}

// Try proxies in order with retries
async function fetchWithProxyRotation(url, timeoutMs = CATEGORY_FETCH_TIMEOUT){
  let lastError = null;
  for(const makeProxyUrl of PROXIES){
    const proxyUrl = makeProxyUrl(url);
    for(let attempt=1; attempt<=ATTEMPTS_PER_PROXY; attempt++){
      try{
        setChannelsStatus(`Fetching ${lastLoadedCategory ? lastLoadedCategory.name : 'category'} — attempt ${attempt} via ${proxyUrl.includes('allorigins') ? 'AllOrigins' : (proxyUrl === url ? 'Direct' : 'Proxy')}`);
        const txt = await fetchTextWithTimeout(proxyUrl, timeoutMs);
        // quick sanity check before returning: M3U should contain EXTM3U or EXTINF lines
        if(txt && (txt.includes('#EXTINF') || txt.includes('#EXTM3U') || txt.toLowerCase().includes('m3u'))) {
          return txt;
        }
        // sometimes proxies wrap text differently; still return if size large
        if(txt && txt.length > 1000) return txt;
        // otherwise treat as invalid and try next
        throw new Error('Invalid playlist content');
      }catch(err){
        lastError = err;
        console.warn(`[IPTV] fetch attempt ${attempt} failed for ${proxyUrl}:`, err && err.message);
        // small backoff between attempts
        await delay(400);
      }
    }
    // continue to next proxy
  }
  throw lastError || new Error('All proxies failed');
}

// Parse M3U (defensive)
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const out = [];
  let pending = null;
  for(let i=0;i<lines.length;i++){
    const raw = lines[i].trim();
    if(!raw) continue;
    if(raw.startsWith('#EXTINF')){
      // Extract tvg-logo and title portion after comma
      const logoMatch = raw.match(/tvg-logo="([^"]+)"/i);
      const nameMatch = raw.match(/,(.*)$/);
      pending = {
        name: nameMatch ? nameMatch[1].trim() : raw.replace('#EXTINF','').trim(),
        logo: logoMatch ? logoMatch[1] : ''
      };
    } else if(!raw.startsWith('#')){
      // this is the URL
      if(pending){
        pending.url = raw;
        out.push(pending);
        pending = null;
      } else {
        // no preceding EXTINF: still include as fallback
        out.push({name: raw, logo:'', url: raw});
      }
    }
    // safe break if too many lines (defensive)
    if(out.length >= 5000) break;
  }
  return out;
}

// playback helpers (hls.js fallback)
function teardownHls(){
  if(currentHls){ try{ currentHls.destroy(); }catch(e){} currentHls = null; }
  try{ videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); }catch(e){}
}
function playStream(item){
  if(!item || !item.url) { playerNotice.textContent = 'No playable URL'; return; }
  nowPlayingEl.textContent = item.name || 'Live';
  playerNotice.textContent = '';
  playerModal.classList.remove('hidden');
  teardownHls();
  const url = item.url;
  // If browser supports native HLS and no hls.js, use native
  if(videoEl.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    videoEl.src = url;
    videoEl.play().catch(()=> playerNotice.textContent = 'Tap to start playback');
    return;
  }
  // use hls.js if available
  if(window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.on(Hls.Events.ERROR, (evt, data) => {
      console.warn('[IPTV] HLS error', data);
      if(data && data.fatal) {
        try{ currentHls.destroy(); }catch(e){}
        playerNotice.textContent = 'Playback error';
      }
      if(data && data.type === Hls.ErrorTypes.NETWORK_ERROR) playerNotice.textContent = 'Playback blocked (CORS/403)';
    });
    currentHls.attachMedia(videoEl);
    try{
      currentHls.loadSource(url);
    }catch(e){
      playerNotice.textContent = 'Failed to load stream';
      return;
    }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> videoEl.play().catch(()=> playerNotice.textContent = 'Tap to start playback'));
    return;
  }
  // fallback: assign URL to video tag
  videoEl.src = url;
  videoEl.play().catch(()=> playerNotice.textContent = 'Playback blocked by browser');
}

// ---------- UI / Rendering ----------
function renderCategories(){
  categoriesEl.innerHTML = '';
  categoriesData.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'categoryCard';
    const img = safeImg(cat.img, 'https://via.placeholder.com/800x400?text=Category');
    card.appendChild(img);
    const overlay = document.createElement('div'); overlay.className = 'overlay';
    const label = document.createElement('div'); label.className = 'label'; label.textContent = cat.name;
    overlay.appendChild(label);
    card.appendChild(overlay);
    card.addEventListener('click', ()=> openCategory(cat));
    categoriesEl.appendChild(card);
  });
  // keep UI responsive on slow devices
  setChannelsStatus('Select a category to load channels');
}

// open category (loads channels on demand)
async function openCategory(cat){
  lastLoadedCategory = cat;
  categoriesEl.classList.add('hidden');
  channelsSection.classList.remove('hidden');
  if(backBtn) backBtn.classList.remove('hidden');
  channelsEl.innerHTML = '';
  channelsTitle.textContent = cat.name;
  setChannelsStatus('Loading playlist...');

  try{
    const text = await fetchWithProxyRotation(cat.url, CATEGORY_FETCH_TIMEOUT);
    setChannelsStatus('Parsing playlist...');
    const parsed = parseM3U(text);
    setChannelsStatus(`Found ${parsed.length} channels — showing first ${MAX_CHANNELS_DISPLAY}`);
    const list = parsed.slice(0, MAX_CHANNELS_DISPLAY);
    if(list.length === 0){
      channelsEl.innerHTML = `<div style="color:#f66;padding:12px">No channels found in this category.</div>`;
      return;
    }
    channelsEl.innerHTML = '';
    for(const ch of list){
      const cc = document.createElement('div'); cc.className = 'channelCard';
      const logo = safeImg(ch.logo || 'https://via.placeholder.com/320x180?text=TV', 'https://via.placeholder.com/320x180?text=TV');
      cc.appendChild(logo);
      const p = document.createElement('p'); p.textContent = ch.name || 'TV Channel';
      cc.appendChild(p);
      cc.addEventListener('click', ()=> playStream(ch));
      channelsEl.appendChild(cc);
    }
  }catch(err){
    console.error('[IPTV] openCategory failed', err);
    channelsEl.innerHTML = `<div style="color:#f66;padding:12px">Failed to load category: ${err && err.message ? err.message : 'Network/CORS error'}</div>`;
    setChannelsStatus('Failed to load category (see console).');
  }
}

// Back / Refresh / Search handlers
if(backBtn) backBtn.addEventListener('click', ()=>{
  categoriesEl.classList.remove('hidden');
  channelsSection.classList.add('hidden');
  if(backBtn) backBtn.classList.add('hidden');
  channelsEl.innerHTML = '';
  channelsTitle.textContent = '';
  setChannelsStatus('Select a category to load channels');
  lastLoadedCategory = null;
});
if(refreshBtn) refreshBtn.addEventListener('click', ()=> {
  if(lastLoadedCategory) openCategory(lastLoadedCategory);
});

// search within visible channels
if(searchInput) searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.channelCard').forEach(card=>{
    const name = (card.querySelector('p')?.textContent || '').toLowerCase();
    card.style.display = q ? (name.includes(q) ? 'inline-block' : 'none') : 'inline-block';
  });
});

// player close
const closePlayerBtn = document.querySelector('.closeBtn');
if(closePlayerBtn) closePlayerBtn.addEventListener('click', ()=>{
  playerModal.classList.add('hidden');
  teardownHls();
});

// ---------- Init ----------
(function init(){
  renderCategories();
  if(backBtn) backBtn.classList.add('hidden');
  channelsSection.classList.add('hidden');
  setChannelsStatus('Ready — hosted mode');
  // if you want auto-open a specific category on load, call openCategory(categoriesData[0]) here
})();
