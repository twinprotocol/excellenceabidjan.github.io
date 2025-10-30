// Netflix-style IPTV World — hosted version (works anywhere)
const SAFE_URL = "https://iptv-org.github.io/iptv/index.m3u";
const NSFW_URL = "https://iptv-org.github.io/iptv/index.nsfw.m3u";
const PROXY = "https://api.allorigins.win/raw?url=";

const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const categorySelect = document.getElementById("categorySelect");
const content = document.getElementById("content");
const modal = document.getElementById("playerModal");
const player = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function fetchPlaylist(url) {
  const res = await fetch(PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error("Network error");
  return await res.text();
}

function parseM3U(text) {
  const lines = text.split("\n");
  const ch = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const info = lines[i];
      const url = lines[i + 1];
      const name = (info.split(",")[1] || "Unknown").trim();
      const country = (info.match(/tvg-country=\"(.*?)\"/) || [,"Other"])[1];
      const logo = (info.match(/tvg-logo=\"(.*?)\"/) || [,""])[1];
      const group = (info.match(/group-title=\"(.*?)\"/) || [,"General"])[1];
      ch.push({ name, country, logo, url, category: group });
    }
  }
  return ch;
}

function groupByCategory(list) {
  const grouped = {};
  list.forEach(ch => {
    const cat = ch.category || "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ch);
  });
  return grouped;
}

function render(list) {
  content.innerHTML = "";
  const grouped = groupByCategory(list);
  Object.entries(grouped).forEach(([cat, chans]) => {
    const section = document.createElement("div");
    section.className = "section";
    section.innerHTML = `<h2>${cat}</h2><div class="row"></div>`;
    const row = section.querySelector(".row");
    chans.forEach(c => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${c.logo || "https://via.placeholder.com/150x90?text="+encodeURIComponent(c.name)}">
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

function fillSelect(select, items, label) {
  select.innerHTML = `<option value="">All ${label}</option>`;
  items.forEach(i => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = i;
    select.appendChild(o);
  });
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

(async function init() {
  try {
    const safe = await fetchPlaylist(SAFE_URL);
    const nsfw = await fetchPlaylist(NSFW_URL);
    allChannels = [...parseM3U(safe), ...parseM3U(nsfw)];

    const countries = [...new Set(allChannels.map(c => c.country))].sort();
    const cats = [...new Set(allChannels.map(c => c.category))].sort();
    fillSelect(countrySelect, countries, "countries");
    fillSelect(categorySelect, cats, "categories");

    render(allChannels);
  } catch (err) {
    content.innerHTML = "<p style='text-align:center;color:#999;'>Failed to load channels.</p>";
    console.error(err);
  }
})();
