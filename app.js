// app.js — UI + playback
// requires fetch_channels.js to define window.loadAndCacheChannels

const contentEl = document.getElementById('content');
const statusEl = document.getElementById('status');
const searchInput = document.getElementById('search');
const countrySelect = document.getElementById('countrySelect');
const contentMode = document.getElementById('contentMode');
const refreshBtn = document.getElementById('refreshBtn');

const playerModal = document.getElementById('playerModal');
const video = document.getElementById('video');
const closePlayer = document.getElementById('closePlayer');
const nowPlaying = document.getElementById('nowPlaying');
const playerNotice = document.getElementById('playerNotice');

let allChannels = [];
let currentHls = null;

function setStatus(t){ if(statusEl) statusEl.textContent = t || ''; }
function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function debounce(fn, t=180){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t); }; }

// normalize/ensure fields
function normalize(ch){
  return {
    name: ch.name || ch.raw?.name || 'Unknown',
    url: ch.url || ch.raw?.url || ch.raw?.url_resolved || '',
    logo: ch.logo || ch.raw?.logo || '',
    country: ch.country || ch.raw?.country || 'Unknown',
    category: (ch.categories && ch.categories[0]) || ch.raw?.categories?.[0] || ch.raw?.group || 'General',
    nsfw: !!ch.nsfw
  };
}

function groupByCategory(list){
  const m = {};
  list.forEach(c => {
    const cat = c.category || 'General';
    if(!m[cat]) m[cat]=[];
    m[cat].push(c);
  });
  return m;
}

function renderRows(list){
  contentEl.innerHTML = '';
  const grouped = groupByCategory(list);
  const cats = Object.keys(grouped);
  if(!cats.length){
    contentEl.innerHTML = `<div class="status">No channels found.</div>`;
    return;
  }
  cats.forEach(cat => {
    const section = document.createElement('section');
    section.className = 'section';
    const title = document.createElement('h2'); title.textContent = cat;
    const row = document.createElement('div'); row.className = 'row';
    grouped[cat].slice(0, 60).forEach(ch => {
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML = `
        <img class="thumb" src="${escapeHtml(ch.logo || `https://via.placeholder.com/320x180?text=${encodeURIComponent(ch.name)}`)}" alt="${escapeHtml(ch.name)}">
        <div class="meta"><div class="title">${escapeHtml(ch.name)}</div><div class="subtitle">${escapeHtml(ch.country)}</div></div>`;
      card.addEventListener('click', ()=> playChannel(ch));
      row.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(row);
    contentEl.appendChild(section);
  });
}

// filters
function applyFilters(){
  const q = (searchInput.value||'').toLowerCase().trim();
  const country = (countrySelect.value||'').toLowerCase();
  const mode = (contentMode.value||'both');
  let list = allChannels.slice();
  if(mode === 'safe') list = list.filter(c=> !c.nsfw);
  if(mode === 'nsfw') list = list.filter(c=> c.nsfw);
  if(country) list = list.filter(c=> (c.country||'').toLowerCase() === country);
  if(q) list = list.filter(c=> (c.name||'').toLowerCase().includes(q) || (c.category||'').toLowerCase().includes(q));
  renderRows(list);
}

// playback
function teardownHls(){
  if(currentHls){ try{ currentHls.destroy(); }catch(e){} currentHls = null; }
  try{ video.pause(); video.removeAttribute('src'); video.load(); }catch(e){}
}

function playChannel(ch){
  nowPlaying.textContent = `${ch.name} — ${ch.country}`;
  playerNotice.textContent = '';
  playerModal.classList.remove('hidden');
  teardownHls();
  const url = ch.url;
  if(!url){ playerNotice.textContent = 'No URL for this channel'; return; }

  if(video.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    video.src = url;
    video.play().catch(()=> playerNotice.textContent = 'Tap to start playback');
    return;
  }
  if(window.Hls && Hls.isSupported()){
    currentHls = new Hls();
    currentHls.on(Hls.Events.ERROR, (evt,data)=> {
      console.warn('HLS error', data);
      if(data && data.fatal) { try{ currentHls.destroy(); }catch(e){} }
      if(data && data.type === Hls.ErrorTypes.NETWORK_ERROR) playerNotice.textContent = 'Playback blocked by host (CORS/403).';
    });
    currentHls.attachMedia(video);
    try{ currentHls.loadSource(url); }catch(e){ playerNotice.textContent = 'Failed to load stream.'; return; }
    currentHls.on(Hls.Events.MANIFEST_PARSED, ()=> video.play().catch(()=> playerNotice.textContent = 'Tap to start')));
    return;
  }
  video.src = url;
  video.play().catch(()=> playerNotice.textContent = 'Playback blocked by browser');
}

// UI events
closePlayer.addEventListener('click', ()=>{
  playerModal.classList.add('hidden');
  teardownHls();
});
searchInput.addEventListener('input', debounce(()=> applyFilters(), 200));
contentMode.addEventListener('change', applyFilters);
refreshBtn.addEventListener('click', async ()=>{
  setStatus('Refreshing channels (force)…');
  try{
    const fresh = await window.loadAndCacheChannels({force:true, timeout:20000});
    allChannels = fresh.map(normalize);
    populateCountry();
    applyFilters();
    setStatus(`Loaded ${allChannels.length} channels (fresh)`);
  }catch(e){
    console.error(e);
    setStatus('Refresh failed. See console.');
  }
});

// populate country dropdown
function populateCountry(){
  const countries = [...new Set(allChannels.map(c=> c.country).filter(Boolean))].sort();
  countrySelect.innerHTML = `<option value="">All countries</option>` + countries.map(c=> `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  countrySelect.addEventListener('change', applyFilters);
}

// init
(async function init(){
  try{
    setStatus('Loading channels & cache (this may take 8–20s first time)…');
    const raw = await window.loadAndCacheChannels({force:false, timeout:20000});
    allChannels = raw.map(normalize);
    if(!allChannels.length){ setStatus('No channels found in cache.'); return; }
    populateCountry();
    applyFilters();
    setStatus(`Loaded ${allChannels.length} channels`);
  }catch(e){
    console.error(e);
    setStatus('Failed to load channels — open console for details.');
    contentEl.innerHTML = `<div class="status">Failed to load channels. Try Refresh, or open console.</div>`;
  }
})();
