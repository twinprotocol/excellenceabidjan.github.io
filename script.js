// IPTV World — Twin Protocol Edition

const PROXY = "https://api.allorigins.win/raw?url=";
const SAFE_URL = "https://iptv-org.github.io/iptv/index.m3u";
const NSFW_URL = "https://iptv-org.github.io/iptv/index.nsfw.m3u";

const status = document.getElementById("status");
const grid = document.getElementById("channelsGrid");
const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const modeSelect = document.getElementById("contentMode");

let allChannels = [];

async function fetchM3U(url) {
  const res = await fetch(PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error("Network error");
  return await res.text();
}

function parseM3U(text) {
  const lines = text.split("\n");
  const channels = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const info = lines[i];
      const url = lines[i + 1];
      const name = (info.split(",")[1] || "Unknown").trim();
      const countryMatch = info.match(/tvg-country="(.*?)"/);
      const logoMatch = info.match(/tvg-logo="(.*?)"/);
      const country = countryMatch ? countryMatch[1] : "Other";
      const logo = logoMatch ? logoMatch[1] : "";
      channels.push({ name, country, logo, url });
    }
  }
  return channels;
}

function renderChannels(list) {
  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div style="color:gray;text-align:center;">No channels found.</div>`;
    return;
  }
  list.forEach((ch) => {
    const card = document.createElement("div");
    card.className = "channel-card";
    card.innerHTML = `
      <img src="${ch.logo || "https://via.placeholder.com/160x100?text=No+Logo"}" alt="">
      <div class="name">${ch.name}</div>
      <div class="country">${ch.country}</div>
    `;
    card.addEventListener("click", () => window.open(ch.url, "_blank"));
    grid.appendChild(card);
  });
}

function updateFilters() {
  const query = searchInput.value.toLowerCase();
  const country = countrySelect.value;
  const filtered = allChannels.filter((ch) => {
    const matchName = ch.name.toLowerCase().includes(query);
    const matchCountry = country === "" || ch.country === country;
    return matchName && matchCountry;
  });
  renderChannels(filtered);
}

async function loadChannels() {
  status.textContent = "Loading channels...";
  grid.innerHTML = "";
  const mode = modeSelect.value;

  try {
    const safe = mode !== "nsfw" ? await fetchM3U(SAFE_URL) : "";
    const nsfw = mode !== "safe" ? await fetchM3U(NSFW_URL) : "";
    allChannels = [...parseM3U(safe), ...parseM3U(nsfw)];

    const countries = [...new Set(allChannels.map((c) => c.country))].sort();
    countrySelect.innerHTML = `<option value="">All countries</option>`;
    countries.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });

    renderChannels(allChannels);
    status.textContent = `Loaded ${allChannels.length} channels`;
  } catch (e) {
    console.error(e);
    status.textContent = "Failed to load playlist (proxy issue)";
  }
}

searchInput.addEventListener("input", updateFilters);
countrySelect.addEventListener("change", updateFilters);
modeSelect.addEventListener("change", loadChannels);

loadChannels();
