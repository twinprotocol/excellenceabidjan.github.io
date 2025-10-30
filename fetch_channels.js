// fetch_channels.js
// Robust fetch + IndexedDB caching for channels.json + nsfw.json
// Usage: await loadAndCacheChannels({force:false, timeout:15000});

(function(){
  const DB_NAME = 'iptv-store';
  const DB_VER = 1;
  const STORE = 'files';

  // open indexedDB
  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, {keyPath:'key'});
      };
      req.onsuccess = ()=> resolve(req.result);
      req.onerror = ()=> reject(req.error);
    });
  }

  async function idbGet(key){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE,'readonly'); const store = tx.objectStore(STORE);
      const r = store.get(key);
      r.onsuccess = ()=> res(r.result ? r.result.value : null);
      r.onerror = ()=> rej(r.error);
    });
  }
  async function idbSet(key, value){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE,'readwrite'); const store = tx.objectStore(STORE);
      const r = store.put({key, value, ts: Date.now()});
      r.onsuccess = ()=> res(true);
      r.onerror = ()=> rej(r.error);
    });
  }

  // try fetch helpers
  async function tryFetchJson(url, timeout=15000){
    const controller = new AbortController();
    const id = setTimeout(()=> controller.abort(), timeout);
    try{
      const res = await fetch(url, {signal: controller.signal});
      clearTimeout(id);
      if(!res.ok) throw new Error('HTTP '+res.status);
      const ct = res.headers.get('content-type') || '';
      if(ct.includes('application/json') || ct.includes('text/json')) return await res.json();
      // sometimes proxies return raw JSON as text
      const text = await res.text();
      try { return JSON.parse(text); } catch(e){ throw new Error('Not JSON'); }
    }catch(e){
      clearTimeout(id);
      throw e;
    }
  }

  // m3u parser helper (to JSON)
  function parseM3UtoArray(text){
    const lines = text.split(/\r?\n/);
    const out = [];
    for(let i=0;i<lines.length;i++){
      const l = lines[i].trim();
      if(!l) continue;
      if(l.startsWith('#EXTINF')){
        const info = l;
        // find next real url
        let url = '';
        for(let j=i+1;j<lines.length;j++){
          const L = lines[j].trim();
          if(!L) continue;
          if(L.startsWith('#')) continue;
          url = L;
          break;
        }
        const title = (info.split(',').slice(1).join(',')||'').trim();
        const attrs = {};
        const re = /([a-zA-Z0-9\-_]+)="([^"]*)"/g;
        let m;
        while((m = re.exec(info)) !== null) attrs[m[1]] = m[2];
        const name = title || attrs['tvg-name'] || attrs['title'] || 'Unknown';
        const country = attrs['tvg-country'] || attrs['group-title'] || attrs['country'] || 'Unknown';
        const logo = attrs['tvg-logo'] || '';
        out.push({ name, country, logo, url, category: attrs['group-title'] || attrs['category'] || 'General' });
      }
    }
    return out;
  }

  // fallback proxies to try for JSON or M3U
  const PROXIES = [
    u => u, // direct
    u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    u => `https://thingproxy.freeboard.io/fetch/${u}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    // jina.ai sometimes mirrors content
    u => `https://r.jina.ai/http://${u.replace(/^https?:\/\//,'')}`,
  ];

  async function fetchWithFallbackJson(url, timeout=15000){
    let lastErr = null;
    for(const make of PROXIES){
      const tryUrl = make(url);
      try{
        const json = await tryFetchJson(tryUrl, timeout);
        if(Array.isArray(json)) return json; // expected array
        // sometimes api returns object with channels property
        if(json && Array.isArray(json.channels)) return json.channels;
        // else if object keyed, return as array of values
        if(json && typeof json === 'object') {
          // transform best-effort
          const arr = Object.values(json).flatMap(v => Array.isArray(v) ? v : []);
          if(arr.length) return arr;
        }
      }catch(e){
        lastErr = e;
        // try next
      }
    }
    throw lastErr || new Error('All proxies failed for JSON');
  }

  async function fetchM3UAndParse(url, timeout=20000){
    for(const make of PROXIES){
      const u = make(url);
      try{
        const controller = new AbortController();
        const id = setTimeout(()=> controller.abort(), timeout);
        const res = await fetch(u, {signal: controller.signal});
        clearTimeout(id);
        if(!res.ok) throw new Error('HTTP '+res.status);
        const text = await res.text();
        if(!text || text.indexOf('#EXTINF')===-1) throw new Error('No EXTINF');
        const arr = parseM3UtoArray(text);
        if(arr.length) return arr;
      }catch(e){
        // continue
      }
    }
    throw new Error('Failed to fetch M3U via proxies');
  }

  // public API: loadAndCacheChannels(options)
  // options: {force:false, timeout:15000}
  async function loadAndCacheChannels(options = {}){
    const {force=false, timeout=15000} = options;
    // try local cache first (unless force)
    if(!force){
      try{
        const cached = await idbGet('channels_all_v1');
        if(cached && Array.isArray(cached) && cached.length>50) return cached;
      }catch(e){}
    }

    // attempt JSON endpoints first (recommended)
    const SAFE_JSON = 'https://iptv-org.github.io/api/channels.json';
    const NSFW_JSON = 'https://iptv-org.github.io/api/nsfw.json';

    let channels = [];
    try{
      // try to fetch SAFE JSON (with fallbacks)
      const safe = await fetchWithFallbackJson(SAFE_JSON, timeout);
      let nsfw = [];
      try { nsfw = await fetchWithFallbackJson(NSFW_JSON, timeout); } catch(e){ nsfw = []; }
      channels = [...safe, ...nsfw].map(it => {
        // normalize minimal fields, keep original
        return {
          name: it.name || it.title || it.channel || '',
          url: it.url_resolved || it.url || (it.urls && it.urls[0]) || '',
          logo: it.logo || it.icon || '',
          country: it.country || (it.languages && it.languages[0]) || (it.tvg && it.tvg.country) || '',
          categories: it.categories || (it.group_title ? [it.group_title] : []),
          raw: it,
          nsfw: !!(it.nsfw || (it.categories && it.categories.includes('NSFW')))
        };
      }).filter(x=> x.name && x.url);
    }catch(jsonErr){
      // JSON fetching failed entirely; fallback to fetching m3u playlists and parsing
      try{
        const SAFE_M3U = 'https://iptv-org.github.io/iptv/index.m3u';
        const NSFW_M3U = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';
        const safeArr = await fetchM3UAndParse(SAFE_M3U, timeout);
        let nsfwArr = [];
        try { nsfwArr = await fetchM3UAndParse(NSFW_M3U, timeout); } catch(e){ nsfwArr = []; }
        const merged = [...safeArr.map(i=>({...i, nsfw:false})), ...nsfwArr.map(i=>({...i, nsfw:true}))];
        channels = merged.map(it => ({
          name: it.name,
          url: it.url,
          logo: it.logo,
          country: it.country,
          categories: [it.category||'General'],
          raw: it,
          nsfw: !!it.nsfw
        }));
      }catch(m3uErr){
        // all attempts failed: rethrow the original JSON error (or combined)
        throw new Error(`All channel fetch attempts failed. JSON error: ${jsonErr?.message || jsonErr}. M3U error: ${m3uErr?.message || m3uErr}`);
      }
    }

    // store to IDB
    try{
      await idbSet('channels_all_v1', channels);
    }catch(e){ console.warn('Failed to cache channels to IDB', e); }
    return channels;
  }

  // export to global
  window.loadAndCacheChannels = loadAndCacheChannels;
})();
