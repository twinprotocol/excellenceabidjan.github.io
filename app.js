const categoriesData = [
  {name:"Auto", url:"https://iptv-org.github.io/iptv/categories/auto.m3u", img:"https://source.unsplash.com/800x400/?car,vehicle"},
  {name:"Animation", url:"https://iptv-org.github.io/iptv/categories/animation.m3u", img:"https://source.unsplash.com/800x400/?animation,cartoon"},
  {name:"Business", url:"https://iptv-org.github.io/iptv/categories/business.m3u", img:"https://source.unsplash.com/800x400/?business,office"},
  {name:"Classic", url:"https://iptv-org.github.io/iptv/categories/classic.m3u", img:"https://source.unsplash.com/800x400/?classic"},
  {name:"Comedy", url:"https://iptv-org.github.io/iptv/categories/comedy.m3u", img:"https://source.unsplash.com/800x400/?comedy,fun"},
  {name:"Cooking", url:"https://iptv-org.github.io/iptv/categories/cooking.m3u", img:"https://source.unsplash.com/800x400/?cooking,food"},
  {name:"Culture", url:"https://iptv-org.github.io/iptv/categories/culture.m3u", img:"https://source.unsplash.com/800x400/?culture"},
  {name:"Documentary", url:"https://iptv-org.github.io/iptv/categories/documentary.m3u", img:"https://source.unsplash.com/800x400/?documentary"},
  {name:"Education", url:"https://iptv-org.github.io/iptv/categories/education.m3u", img:"https://source.unsplash.com/800x400/?education"},
  {name:"Entertainment", url:"https://iptv-org.github.io/iptv/categories/entertainment.m3u", img:"https://source.unsplash.com/800x400/?entertainment,show"},
  {name:"Family", url:"https://iptv-org.github.io/iptv/categories/family.m3u", img:"https://source.unsplash.com/800x400/?family"},
  {name:"General", url:"https://iptv-org.github.io/iptv/categories/general.m3u", img:"https://source.unsplash.com/800x400/?tv,channel"},
  {name:"Kids", url:"https://iptv-org.github.io/iptv/categories/kids.m3u", img:"https://source.unsplash.com/800x400/?kids,cartoon"},
  {name:"Legislative", url:"https://iptv-org.github.io/iptv/categories/legislative.m3u", img:"https://source.unsplash.com/800x400/?government,parliament"},
  {name:"Lifestyle", url:"https://iptv-org.github.io/iptv/categories/lifestyle.m3u", img:"https://source.unsplash.com/800x400/?lifestyle"},
  {name:"Movies", url:"https://iptv-org.github.io/iptv/categories/movies.m3u", img:"https://source.unsplash.com/800x400/?movies,film"},
  {name:"Music", url:"https://iptv-org.github.io/iptv/categories/music.m3u", img:"https://source.unsplash.com/800x400/?music"},
  {name:"News", url:"https://iptv-org.github.io/iptv/categories/news.m3u", img:"https://source.unsplash.com/800x400/?news"},
  {name:"Outdoor", url:"https://iptv-org.github.io/iptv/categories/outdoor.m3u", img:"https://source.unsplash.com/800x400/?outdoor"},
  {name:"Relax", url:"https://iptv-org.github.io/iptv/categories/relax.m3u", img:"https://source.unsplash.com/800x400/?relax"},
  {name:"Religious", url:"https://iptv-org.github.io/iptv/categories/religious.m3u", img:"https://source.unsplash.com/800x400/?religion"},
  {name:"Series", url:"https://iptv-org.github.io/iptv/categories/series.m3u", img:"https://source.unsplash.com/800x400/?series,show"},
  {name:"Science", url:"https://iptv-org.github.io/iptv/categories/science.m3u", img:"https://source.unsplash.com/800x400/?science"},
  {name:"Shop", url:"https://iptv-org.github.io/iptv/categories/shop.m3u", img:"https://source.unsplash.com/800x400/?shopping"},
  {name:"Sports", url:"https://iptv-org.github.io/iptv/categories/sports.m3u", img:"https://source.unsplash.com/800x400/?sports"},
  {name:"Travel", url:"https://iptv-org.github.io/iptv/categories/travel.m3u", img:"https://source.unsplash.com/800x400/?travel"},
  {name:"Weather", url:"https://iptv-org.github.io/iptv/categories/weather.m3u", img:"https://source.unsplash.com/800x400/?weather"},
  {name:"XXX", url:"https://iptv-org.github.io/iptv/categories/xxx.m3u", img:"https://source.unsplash.com/800x400/?entertainment,adult", rename:"Special Interest"},
  {name:"Undefined", url:"https://iptv-org.github.io/iptv/categories/undefined.m3u", img:"https://source.unsplash.com/800x400/?tv,random", rename:"Miscellaneous"}
];

const categoriesEl = document.getElementById("categories");
const channelsEl = document.getElementById("channels");
const searchInput = document.getElementById("search");

const playerModal = document.getElementById("playerModal");
const videoEl = document.getElementById("video");
const closeBtn = document.getElementById("closeBtn");
const nowPlayingEl = document.getElementById("nowPlaying");
const playerNotice = document.getElementById("playerNotice");

// Build category banners
categoriesData.forEach(cat=>{
  const card = document.createElement("div");
  card.className="categoryCard";
  card.innerHTML=`<img src="${cat.img}" alt=""><span>${cat.rename||cat.name}</span>`;
  card.addEventListener("click",()=>loadCategory(cat));
  categoriesEl.appendChild(card);
});

// Load M3U channels for a category
async function loadCategory(cat){
  channelsEl.innerHTML="";
  channelsEl.classList.remove("hidden");
  categoriesEl.classList.add("hidden");
  try{
    const res = await fetch(cat.url);
    const text = await res.text();
    const channels = parseM3U(text);
    channels.forEach(ch=>{
      const c = document.createElement("div");
      c.className="channelCard";
      c.innerHTML=`<img src="${ch.logo||'https://via.placeholder.com/320x180?text=TV'}" alt=""><p>${ch.name}</p>`;
      c.addEventListener("click",()=>playChannel(ch));
      channelsEl.appendChild(c);
    });
  }catch(e){
    channelsEl.innerHTML=`<p style="color:red">Failed to load category. Check network.</p>`;
    console.error(e);
  }
}

// Simple M3U parser
function parseM3U(text){
  const lines = text.split(/\r?\n/);
  const res=[];
  let current={};
  lines.forEach(line=>{
    line=line.trim();
    if(!line) return;
    if(line.startsWith("#EXTINF")){
      const logoMatch=line.match(/tvg-logo="(.*?)"/);
      const nameMatch=line.match(/,(.*)/);
      current={name:nameMatch?nameMatch[1].trim():line, logo:logoMatch?logoMatch[1]:""};
    }else if(!line.startsWith("#")){
      current.url=line;
      if(current.name && current.url) res.push(current);
      current={};
    }
  });
  return res;
}

// Playback
let currentHls = null;
function teardownHls(){if(currentHls){currentHls.destroy();currentHls=null;} try{videoEl.pause();videoEl.removeAttribute('src');videoEl.load();}catch(e){}}
function playChannel(ch){
  nowPlayingEl.textContent=ch.name;
  playerNotice.textContent='';
  playerModal.classList.remove("hidden");
  teardownHls();
  const url = ch.url;
  if(!url){ playerNotice.textContent="No playable URL"; return;}
  if(videoEl.canPlayType('application/vnd.apple.mpegurl') && !window.Hls){
    videoEl.src=url; videoEl.play().catch(()=>playerNotice.textContent='Tap to start');
    return;
  }
  if(window.Hls && Hls.isSupported()){
    currentHls=new Hls();
    currentHls.attachMedia(videoEl);
    currentHls.loadSource(url);
    currentHls.on(Hls.Events.MANIFEST_PARSED,()=>videoEl.play().catch(()=>playerNotice.textContent='Tap to start'));
    currentHls.on(Hls.Events.ERROR,(evt,data)=>{if(data.fatal)currentHls.destroy();});
    return;
  }
  videoEl.src=url; videoEl.play().catch(()=>playerNotice.textContent='Blocked');
}

// Close modal
closeBtn.addEventListener("click",()=>{
  playerModal.classList.add("hidden");
  teardownHls();
});

// Search filter
searchInput.addEventListener("input",()=>{
  const q=searchInput.value.trim().toLowerCase();
  document.querySelectorAll(".channelCard").forEach(c=>{
    const name=c.querySelector("p").textContent.toLowerCase();
    c.style.display=name.includes(q)?"inline-block":"none";
  });
});
