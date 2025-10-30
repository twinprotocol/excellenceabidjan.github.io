// app.js — stable fixed version
// Supports: https://iptv-org.github.io/iptv/index.m3u and index.nsfw.m3u
// Never prints raw URLs to UI. Use a static server to avoid CORS issues.

// CONFIG
const M3U_SAFE = 'https://iptv-org.github.io/iptv/index.m3u';
const M3U_NSFW = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';
const FETCH_TIMEOUT_MS = 12000; // 12s

// DOM
const status = document.getElementById('status');
const channelsGrid = document.getElementById('channelsGrid');
const countryList = document.getElementById('countryList');
const countrySelect = document.getElementById('countrySelect');
const searchInput = document.getElementById('search');
const contentMode = document.getElementById('contentMode');
const nowPlaying = document.getElementById('nowPlaying');
const notice = document.getElementById('notice');

const video = document.getElementById('video');
const btnMute = document.getElementById('btnMute');
const btnFullscreen = document.getElementById('btnFullscreen');

let allChannels = [];
let grouped = {};
let currentHls = null;
let lastFilter = { q: '', country: '' };

// UTIL
function setStatus(t){ status.textContent = t || ''; }
function setNotice(t){ notice.textContent = t || ''; }
function safe(val){ return (val||'').toString(); }

// FETCH WITH TIMEOUT
async function fetchWithTimeout(url, timeout = FETCH_TIMEOUT_MS){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), timeout);
  try{
    const res = await fetch(url, {signal: controller.signal});
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }finally{
    clearTimeout(id);
  }
}

// PARSER
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
      const parts = info.split(',');
      const title = (parts.slice(1).join(',') || '').trim();
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9\-_]+)="([^"]*)"/g;
      let m;
      while ((m = attrRegex.exec(info)) !== null){
        attrs[m[1]] = m[2];
      }
      const name = title || attrs['tvg-name'] || attrs['title'] || 'Unknown Channel';
      const country = attrs['tvg-country'] || attrs['group-title'] || 'Other';
      const logo = attrs['tvg-logo'] || '';
      channels.push({ name: safe(name), country: safe(country), logo: safe(logo), _url: streamUrl });
    }
  }
  return channels;
}

// GROUP
function groupByCountry(channels){
  const map = {};
  for (const ch of channels){
    const c = ch.country || 'Other';
    (map[c] = map[c] || []).push(ch);
  }
  // order with 'Other' last
  const keys = Object.keys(map).sort((a,b)=>{
    if (a==='Other') return 1;
    if (b==='Other') return -1;
    return a.localeCompare(b);
  });
  const ordered = {};
  for (const k of keys) ordered[k] = map[k];
  return ordered;
}

// RENDER COUNTRIES
function renderCountryList(groupedObj){
  countryList.innerHTML = '';
  countrySelect.innerHTML = '';
  const opt = document.createElement('option'); opt.value=''; opt.textContent='All countries'; countrySelect.appendChild(opt);

  Object.entries(groupedObj).forEach(([country, arr])=>{
    const div = document.createElement('div');
    div.className = 'country-item';
    div.dataset.country = country;
    div.innerHTML = `<span>${escapeHtml(country)}</span><small style="opacity:.7">${arr.length}</small>`;
    div.addEventListener('click', ()=> {
      document.querySelectorAll('.country-item').forEach(e=>e.classList.remove('active'));
      div.classList.add('active');
      countrySelect.value = country;
      applyFilters();
      // keep focus for keyboard users
      div.focus();
    });
    countryList.appendChild(div);

    const option = document.createElement('option');
    option.value = country;
    option.textContent = `${country} (${arr.length})`;
    countrySelect.appendChild(option);
  });
}

// RENDER CHANNELS (no URLs shown anywhere)
function renderChannels(list){
  channelsGrid.innerHTML = '';
  if (!list || list.length === 0){
    channelsGrid.innerHTML = `<div style="color:var(--muted);padding:16px">No channels found.</div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const ch of list){
    const card = document.createElement('div');
    card.className = 'channel-card';
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.title = ch.name;
    const logoHtml = ch.logo ? `<img loading="lazy" alt="${escapeHtml(ch.name)}" src="${escapeHtml(ch.logo)}">` : '<svg width="64" height="40" viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="40" rx="6" fill="#0b0b12"/></svg>';
    card.innerHTML = `
      <div class="channel-logo">${logoHtml}</div>
      <div class="channel-meta">
        <div class="channel-name">${escapeHtml(ch.name)}</div>
        <div class="channel-sub">${escapeHtml(ch.country)}</div>
      </div>
    `;
    card.addEventListener('click', ()=> playChannel(ch));
    card.addEventListener('keydown', (ev)=> { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); playChannel(ch);} });
    frag.appendChild(card);
  }
  channelsGrid.appendChild(frag);
}

// ESCAPE
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// FILTERS (debounced search)
let searchTimer = null;
searchInput.addEventListener('input', ()=>{
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(()=> applyFilters(), 180);
});
countrySelect.addEventListener('change', ()=> applyFilters());
contentMode.addEventListener('change', ()=> loadPlaylists()); // change source

function applyFilters(){
  const q = (searchInput.value||'').toLowerCase().trim();
  const country = countrySelect.value;
  lastFilter.q = q; lastFilter.country = country;

  let list = allChannels.slice();
  if (country) list = list.filter(c => (c.country||'').toLowerCase() === country.toLowerCase());
  if (q) list = list.filter(c => (c.name||'').toLowerCase().includes(q) || (c.country||'').toLowerCase().includes(q));
  renderChannels(list);
}

// PLAYBACK — keeps URL internal
function teardownHls(){
  if (currentHls){
