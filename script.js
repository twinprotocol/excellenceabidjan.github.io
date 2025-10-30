// IPTV World (offline-friendly, no proxy) by Twin Protocol

const SAFE_FILE = "index.m3u";
const NSFW_FILE = "index.nsfw.m3u";

const statusBox = document.getElementById("status");
const grid = document.getElementById("channelsGrid");
const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const categorySelect = document.getElementById("categorySelect");
const modal = document.getElementById("playerModal");
const player = document.getElementById("videoPlayer");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function fetchLocalFile(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error("Cannot read local " + file);
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
      const country = (info.match(/tvg-country="(.*?)"/) || [,"Other"])[1];
      const logo = (info.match(/tvg-logo="(.*?)"/) || [,""])[1];
      const group = (info.match(/group-title="(.*?)"/) || [,"General"])[1];
      ch.push({ name, country, logo, url, category: group });
    }
  }
  return ch;
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

function render(list) {
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div style="color:gray;text-align:center;">No channels found</div>`;
    return;
  }
  for (const c of list) {
    const card = document.createElement("div");
    card.className = "channel";
    card.innerHTML = `
      <img src="${c.logo || "https://via.placeholder.com/150x90?text=No+Logo"}">
      <div class="name">${c.name}</div>
      <div class="country">${c.country}</div>
      <div class="category">${c.category}</div>`;
    card.onclick = () => playChannel(c.url);
    grid.appendChild(card);
  }
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
  player.play().catch(e => console.log("Play error:", e));
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
    statusBox.textContent = "Loading local channels…";
    const safe = await fetchLocalFile(SAFE_FILE);
    const nsfw = await fetchLocalFile(NSFW_FILE);
    allChannels = [...parseM3U(safe), ...parseM3U(nsfw)];

    const countries = [...new Set(allChannels.map(c => c.country))].sort();
    const cats = [...new Set(allChannels.map(c => c.category))].sort();
    fillSelect(countrySelect, countries, "countries");
    fillSelect(categorySelect, cats, "categories");

    render(allChannels);
    statusBox.textContent = `Loaded ${allChannels.length} channels`;
  } catch (e) {
    console.error(e);
    statusBox.textContent = "Failed to read local playlists.";
  }
})();
