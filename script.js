const SAFE_URL = "https://iptv-org.github.io/iptv/index.m3u";
const NSFW_URL = "https://iptv-org.github.io/iptv/index.nsfw.m3u";

// multiple fallbacks for reliability
const PROXIES = [
  "https://corsproxy.io/?",
  "https://thingproxy.freeboard.io/fetch/",
  "https://api.allorigins.win/raw?url="
];

const FALLBACK_JSON =
  "https://iptv-org.github.io/api/channels.json"; // permanent backup

const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const categorySelect = document.getElementById("categorySelect");
const content = document.getElementById("content");
const modal = document.getElementById("playerModal");
const player = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function fetchWithFallback(url) {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url));
      if (res.ok) return await res.text();
    } catch (e) {}
  }
  throw new Error("All proxies failed");
}

function parseM3U(text) {
  const lines = text.split("\n");
  const ch = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const info = lines[i];
      const url = lines[i + 1];
      if (!url || !url.startsWith("http")) continue;
      const name = (info.split(",")[1] || "Unknown").trim();
      const country = (info.match(/tvg-country=\"(.*?)\"/) || [,"Unknown"])[1];
      const logo = (info.match(/tvg-logo=\"(.*?)\"/) || [,""])[1];
      const group = (info.match(/group-title=\"(.*?)\"/) || [,"General"])[1];
      ch.push({ name, country, logo, url, category: group });
    }
  }
  return ch;
}

function render(list) {
  content.innerHTML = "";
  const grouped = {};
  list.forEach(ch => {
    const cat = ch.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ch);
  });
  Object.entries(grouped).forEach(([cat, chans]) => {
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `<h2>${cat}</h2><div class="row"></div>`;
    const row = section.querySelector(".row");
    chans.slice(0, 20).forEach(c => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${c.logo || "https://via.placeholder.com/150x90?text=" + encodeURIComponent(c.name)}" alt="">
        <div class="info">
          <div class="name">${c.name}</div>
          <div class="country">${c.country}</div>
        </div>`;
      card.onclick = () => playChannel(c.url);
      row.appendChild(card);
    });
    content.appendChild(section);
  });
}

function fillSelect(select, items, label) {
  select.innerHTML = `<option value="">All ${label}</option>`;
  items.forEach(i => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i;
    select.appendChild(o);
  });
}

function filter() {
  const q = searchInput.value.toLowerCase();
  const country = countrySelect.value;
  const cat = categorySelect.value;
  const filtered = allChannels.filter(c =>
    c.name.toLowerCase().includes(q) &&
    (country === "" || c.country === country) &&
    (cat === "" || c.category === cat)
  );
  render(filtered);
}

function playChannel(url) {
  modal.classList.remove("hidden");
  player.src = url;
  player.play().catch(e => console.log("playback error", e));
}

closePlayer.onclick = () => {
  modal.classList.add("hidden");
  player.pause();
  player.src = "";
};

searchInput.oninput = filter;
countrySelect.onchange = filter;
categorySelect.onchange = filter;

async function loadChannels() {
  try {
    // try m3u playlists first
    const safe = await fetchWithFallback(SAFE_URL);
    const nsfw = await fetchWithFallback(NSFW_URL);
    return [...parseM3U(safe), ...parseM3U(nsfw)];
  } catch (e) {
    console.warn("Fallback to JSON source", e);
    // fallback to JSON API if M3U fails
    const res = await fetch(FALLBACK_JSON);
    const json = await res.json();
    return json.map(c => ({
      name: c.name,
      country: c.country || "Unknown",
      logo: c.logo || "",
      url: c.url_resolved || "",
      category: c.categories && c.categories[0] ? c.categories[0] : "General"
    }));
  }
}

(async function init() {
  try {
    allChannels = await loadChannels();
    const countries = [...new Set(allChannels.map(c => c.country))].sort();
    const cats = [...new Set(allChannels.map(c => c.category))].sort();
    fillSelect(countrySelect, countries, "countries");
    fillSelect(categorySelect, cats, "categories");
    render(allChannels);
  } catch (err) {
    console.error(err);
    content.innerHTML = `<p style='text-align:center;color:#999;'>Failed to load channels. Try again later.</p>`;
  }
})();
