/* script.js — Netflix+ robust loader
   - categories shown immediately (images from Unsplash CDN)
   - channels loaded on category click (fetch with fallback proxies)
   - parse M3U, show logos, play with HLS fallback
   - back, refresh, search supported
*/

// ---------- CONFIG ----------
const MAX_CHANNELS_DISPLAY = 120;
const CATEGORY_FETCH_TIMEOUT = 20000; // ms

// Category list (images are stable Unsplash links)
const categoriesData = [
  {name:"Auto", url:"https://iptv-org.github.io/iptv/categories/auto.m3u", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=60"},
  {name:"Animation", url:"https://iptv-org.github.io/iptv/categories/animation.m3u", img:"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1400&q=60"},
  {name:"Business", url:"https://iptv-org.github.io/iptv/categories/business.m3u", img:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=60"},
  {name:"Classic", url:"https://iptv-org.github.io/iptv/categories/classic.m3u", img:"https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1400&q=60"},
  {name:"Comedy", url:"https://iptv-org.github.io/iptv/categories/comedy.m3u", img:"https://images.unsplash.com/photo-1520975927634-7f2d4cbcc6b5?auto=format&fit=crop&w=1400&q=60"},
  {name:"Cooking", url:"https://iptv-org.github.io/iptv/categories/cooking.m3u", img:"https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1400&q=60"},
  {name:"Culture", url:"https://iptv-org.github.io/iptv/categories/culture.m3u", img:"https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1400&q=60"},
  {name:"Documentary", url:"https://iptv-org.github.io/iptv/categories/documentary.m3u", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60"},
  {name:"Education", url:"https://iptv-org.github.io/iptv/categories/education.m3u", img:"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=60"},
  {name:"Entertainment", url:"https://iptv-org.github.io/iptv/categories/entertainment.m3u", img:"https://images.unsplash.com/photo-1511763368359-5e0b2fb2b1a9?auto=format&fit=crop&w=1400&q=60"},
  {name:"Family", url:"https://iptv-org.github.io/iptv/categories/family.m3u", img:"https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=60"},
  {name:"General", url:"https://iptv-org.github.io/iptv/categories/general.m3u", img:"https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=60"},
  {name:"Kids", url:"https://iptv-org.github.io/iptv/categories/kids.m3u", img:"https://images.unsplash.com/photo-1504240399381-3a2da6f2b1ec?auto=format&fit=crop&w=1400&q=60"},
  {name:"Legislative", url:"https://iptv-org.github.io/iptv/categories/legislative.m3u", img:"https://images.unsplash.com/photo-1526318472351-c75fcf070b36?auto=format&fit=crop&w=1400&q=60"},
  {name:"Lifestyle", url:"https://iptv-org.github.io/iptv/categories/lifestyle.m3u", img:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=60"},
  {name:"Movies", url:"https://iptv-org.github.io/iptv/categories/movies.m3u", img:"https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=60"},
  {name:"Music", url:"https://iptv-org.github.io/iptv/categories/music.m3u", img:"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=60"},
  {name:"News", url:"https://iptv-org.github.io/iptv/categories/news.m3u", img:"https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=60"},
  {name:"Outdoor", url:"https://iptv-org.github.io/iptv/categories/outdoor.m3u", img:"https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1400&q=60"},
  {name:"Relax", url:"https://iptv-org.github.io/iptv/categories/relax.m3u", img:"https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=60"},
  {name:"Religious", url:"https://iptv-org.github.io/iptv/categories/religious.m3u", img:"https://images.unsplash.com/photo-1503455637927-5d3a0f9ec0a3?auto=format&fit=crop&w=1400&q=60"},
  {name:"Series", url:"https://iptv-org.github.io/iptv/categories/series.m3u", img:"https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1400&q=60"},
  {name:"Science", url:"https://iptv-org.github.io/iptv/categories/science.m3u", img:"https://images.unsplash.com/photo-1508385082359-fda82f7f2a90?auto=format&fit=crop&w=1400&q=60"},
  {name:"Shop", url:"https://iptv-org.github.io/iptv/categories/shop.m3u", img:"https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1400&q=60"},
  {name:"Sports", url:"https://iptv-org.github.io/iptv/categories/sports.m3u", img:"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=60"},
  {name:"Travel", url:"https://iptv-org.github.io/iptv/categories/travel.m3u", img:"https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=60"},
  {name:"Weather", url:"https://iptv-org.github.io/iptv/categories/weather.m3u", img:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=60"},
  // renamed ones
  {name:"Special Interest", url:"https://iptv-org.github.io/iptv/categories/xxx.m3u", img:"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1400&q=60"},
  {name:"Miscellaneous", url:"https://iptv-org.github.io/iptv/categories/undefined.m3u", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60"},
];

// Proxies to try in order (direct first)
const PROXIES = [
  u => u,
  u => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://thingproxy.freeboard.io/fetch/${u}`,
  u => `https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`
];

// DOM
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
const closeBtn = document.getElementById('closePlayer') || document.getElementById('closePlayer') /*support older ids*/;
const nowPlayingEl = document.getElementById('nowPlaying');
const playerNotice = document.getElementById('playerNotice');

let lastLoadedCategory = null;
let currentHls = null;

// safe image helper
function safeImg(src, fallback){
  const img = document.createElement('img');
  img.src = src;
  img.onerror = ()=> { if(fallback) img.src = fallback; };
  return img;
}

// render category cards immediately
function renderCategories(){
  categoriesEl.innerHTML = '';
  categoriesData.forEach(cat=>{
    const card = document.createElement('div');
    card.className = 'categoryCard';
    const img = safeImg(cat.img, 'https://via.placeholder.com/800x400?text=Category');
    card.appendChild(img);
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = cat.name;
    overlay.appendChild(label);
    card.appendChild(overlay);
    card.addEventListener('click', ()=> openCategory(cat));
    categoriesEl.appendChild(card);
  });
}

// fetch with fallback proxies, returns text
async function fetchWithFallback(url, timeout= CATEGORY_FETCH_TIMEOUT){
  let lastErr = null;
  for(const maker of PROXIES){
    const u = maker(url);
    try{
      const t = await fetchTextWithTimeout(u, timeout);
      // sanity: must contain EXTINF or EXTM3U
      if(!t || (t.indexOf('#EXTINF')===-1 && t.indexOf('EXTM3U')===-1)) throw new Error('Invalid playlist content');
      return t;
    }catch(e){
      lastErr = e;
      console.warn('fetch attempt failed:', u, e && e.message);
      // try next
    }
  }
  throw lastErr || new Error('All fetch attempts failed');
}

async function fetchTextWithTimeout(url, timeout){
  const controller = new AbortController();
  const id = setTimeout(()=> controller.abort(), timeout);
  try{
    const res = await fetch(url, {signal: controller.signal, credentials:'omit'});
    clearTimeout(id);
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.text();
  }finally{ clearTimeout(id); }
}

// parse M3U -> {name,logo,url}
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const arr = [];
  let pending = null;
  for(let i=0;i<lines.length;i++){
    const line = lines[i].trim();
    if(!line) continue;
    if(line.startsWith('#EXTINF')){
      const logoM = line.match(/tvg-logo="([^"]+)"/);
      const nameM = line.match(/,(.*)$/);
      pending = { name: nameM ? nameM[1].trim() : 'Unknown', logo: logoM ? logoM[1] : '' };
    } else if(!line.startsWith('#')){
      if(pending){
        pending.url = line;
        arr.push(pending);
        pending = null;
      } else {
        // URL without EXTINF
        arr.push({ name: line, logo:'', url:line });
      }
    }
  }
  return arr;
}

// open category (load on click)
async function openCategory(cat){
  lastLoadedCategory = cat;
  categoriesEl.classList.add('hidden');
  channelsSection.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  channelsEl.innerHTML = '';
  channelsTitle.textContent = cat.name;
  channelsStatus.textContent = 'Loading…';

  try{
    const text = await fetchWithFallback(cat.url, CATEGORY_FETCH_TIMEOUT);
    const list = parseM3U(text);
    channelsStatus.textContent = `${list.length} channels (showing first ${MAX_CHANNELS_DISPLAY})`;
    const show = list.slice(0, MAX_CHANNELS_DISPLAY);
    if(!show.length){
      channelsEl.innerHTML = `<div style="color:#f66;padding:12px">No channels found in this category.</div>`;
      return;
    }
    show.forEach(ch=>{
      const cc = document.createElement('div');
      cc.className = 'channelCard';
      const logo = safeImg(ch.logo || 'https://via.placeholder.com/320x180?text=TV', 'https://via.placeholder.com/320x180?text=TV');
      cc.appendChild(logo);
      const p = document.createElement('p');
      p.textContent = ch.name;
      cc.appendChild(p);
      cc.addEventListener('click', ()=> playChannel(ch));
      channelsEl.appendChild(cc);
    });
  }catch(err){
    console.error('Category fetch failed', err);
    channelsStatus.textContent = 'Failed to load (network/CORS).';
    channelsEl.innerHTML = `<div style="color:#f66;padding:12px">Failed to load category. Try Refresh or open console.</div>`;
  }
}

// back button
backBtn.addEventListener('click', ()=>{
  categoriesEl.classList.remove('hidden');
  channelsSection.classList.add('hidden');
  backBtn.classList.add('hidden');
  channelsEl.innerHTML = '';
  channelsStatus.textContent = '';
  lastLoadedCategory = null;
});

// refresh
refreshBtn.addEventListener('click', ()=>{
  if(lastLoadedCategory) openCategory(lastLoadedCategory);
});

// search within shown channels
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.channelCard').forEach(card=>{
    const txt = (card.querySelector('p')?.textContent || '').toLowerCase();
    card.style.display = q ? (txt.includes(q) ? 'inline-block' : 'none') : 'inline-block';
  });
});

// Playback with hls.js fallback
function teardownHls(){ if(currentHls){ try{ currentHls.destroy(); }catch(e){} currentHls = null; } try{ videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); }catch(e){} }
function playChannel(ch){
  nowPlayingEl.textContent = ch.name;
  playerNotice.textContent = '';
  playerModal.classList.remove('hidden');
  teardownHls();
  const url = ch.url;
  if(!url){ playerNotice.textContent = 'No playable URL'; return; }
  // native HLS
  if(videoEl.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    videoEl.src = url; videoEl.play().catch(()=> playerNotice.textContent='Tap to start');
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
    try{ currentHls.loadSource(url); }catch(e){ playerNotice.textContent='Failed to load stream.'; return; }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> videoEl.play().catch(()=> playerNotice.textContent='Tap to start'));
    return;
  }
  videoEl.src = url; videoEl.play().catch(()=> playerNotice.textContent='Playback blocked by browser');
}

// close player
const closePlayerBtn = document.querySelector('.closeBtn');
if(closePlayerBtn) closePlayerBtn.addEventListener('click', ()=> {
  playerModal.classList.add('hidden');
  teardownHls();
});

// init
(function init(){
  renderCategories();
  backBtn.classList.add('hidden');
  channelsSection.classList.add('hidden');
})();
