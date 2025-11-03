// Anime-only IPTV App — mobile/TV compatible
const PLAYLIST_URL = "https://iptv-org.github.io/iptv/categories/animation.m3u";
const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("search");
const themeSelect = document.getElementById("themeSelect");
const refreshBtn = document.getElementById("refreshBtn");
const modal = document.getElementById("playerModal");
const video = document.getElementById("video");
const nowPlaying = document.getElementById("nowPlaying");
const playerNotice = document.getElementById("playerNotice");
const closeBtn = document.getElementById("closePlayer");

let currentHls = null, channels = [];

/* ---------- THEME ---------- */
function setTheme(t){
  document.body.dataset.theme = t;
  localStorage.setItem("theme",t);
}
themeSelect.addEventListener("change",()=>setTheme(themeSelect.value));
setTheme(localStorage.getItem("theme") || "dark");

/* ---------- FETCH HELPERS ---------- */
const PROXIES = [
  u=>u,
  u=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u=>`https://corsproxy.io/?${encodeURIComponent(u)}`,
  u=>`https://thingproxy.freeboard.io/fetch/${u}`,
  u=>`https://cors.isomorphic-git.org/${u}`,
];

async function fetchPlaylist(url){
  for(const make of PROXIES){
    try{
      const res = await fetch(make(url),{mode:"cors"});
      if(res.ok){
        const text = await res.text();
        if(text.includes("#EXTM3U")) return text;
      }
    }catch(e){/*try next*/}
  }
  throw new Error("All proxy attempts failed");
}

/* ---------- PARSE M3U ---------- */
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const out = [];
  let tmp = {};
  for(const l of lines){
    if(l.startsWith("#EXTINF")){
      const n = l.match(/,(.*)$/);
      const logo = l.match(/tvg-logo="([^"]+)"/i);
      tmp = {name:n?n[1].trim():"Unknown",logo:logo?logo[1]:""};
    }else if(l && !l.startsWith("#")){
      tmp.url = l.trim(); out.push(tmp); tmp={};
    }
  }
  return out;
}

/* ---------- RENDER ---------- */
function render(list){
  gridEl.innerHTML="";
  if(!list.length){statusEl.textContent="No channels.";return;}
  for(const ch of list){
    const card=document.createElement("div");
    card.className="card";
    const img=document.createElement("img");
    img.src=ch.logo||"https://via.placeholder.com/320x180?text=Anime";
    img.onerror=()=>img.src="https://via.placeholder.com/320x180?text=Anime";
    const p=document.createElement("p");p.textContent=ch.name;
    card.append(img,p);
    card.onclick=()=>play(ch);
    gridEl.append(card);
  }
}

/* ---------- PLAYER ---------- */
function stop(){
  if(currentHls){currentHls.destroy();currentHls=null;}
  video.pause();video.removeAttribute("src");video.load();
}
function play(ch){
  nowPlaying.textContent=ch.name;
  modal.classList.remove("hidden");
  stop();
  const src=ch.url;
  if(Hls.isSupported()){
    currentHls=new Hls();
    currentHls.attachMedia(video);
    currentHls.on(Hls.Events.MEDIA_ATTACHED,()=>currentHls.loadSource(src));
    currentHls.on(Hls.Events.MANIFEST_PARSED,()=>video.play());
    currentHls.on(Hls.Events.ERROR,()=>playerNotice.textContent="Stream error / CORS blocked");
  }else if(video.canPlayType("application/vnd.apple.mpegurl")){
    video.src=src;video.play().catch(()=>playerNotice.textContent="Tap to start");
  }else{video.src=src;video.play();}
}
closeBtn.onclick=()=>{modal.classList.add("hidden");stop();};

/* ---------- LOAD ---------- */
async function load(){
  statusEl.textContent="Loading playlist …";
  try{
    const txt=await fetchPlaylist(PLAYLIST_URL);
    channels=parseM3U(txt);
    render(channels);
    statusEl.textContent=`${channels.length} anime channels loaded`;
  }catch(e){statusEl.textContent="Failed to load playlist";}
}
refreshBtn.onclick=load;
searchInput.oninput=()=>{
  const q=searchInput.value.toLowerCase();
  document.querySelectorAll(".card").forEach(c=>{
    c.style.display=c.textContent.toLowerCase().includes(q)?"block":"none";
  });
};

/* ---------- INIT ---------- */
load();
