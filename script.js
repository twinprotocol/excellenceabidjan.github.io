const PROXY = "https://cors-proxy.fringe.zone/?";
const M3U_SAFE = PROXY + "https://iptv-org.github.io/iptv/index.m3u";
const M3U_NSFW = PROXY + "https://iptv-org.github.io/iptv/index.nsfw.m3u";

const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const countryList = document.getElementById("countryList");
const contentMode = document.getElementById("contentMode");
const grid = document.getElementById("channelsGrid");
const sectionTitle = document.getElementById("sectionTitle");

const modal = document.getElementById("playerModal");
const closeBtn = document.getElementById("closePlayer");
const video = document.getElementById("video");
const nowPlaying = document.getElementById("nowPlaying");

let all = [];
let grouped = {};
let currentHls = null;

// =============== FETCH + PARSE ===============
async function loadM3U(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch playlist");
  return await res.text();
}

function parseM3U(data) {
  const lines = data.split("\n");
  const channels = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF")) {
      const next = lines[i + 1] ? lines[i + 1].trim() : "";
      const attrs = {};
      line.replace(/([a-zA-Z0-9-]+)="([^"]*)"/g, (_, k, v) => (attrs[k] = v));
      const name = (line.split(",")[1] || attrs["tvg-name"] || "Unknown").trim();
      const country = attrs["tvg-country"] || "Other";
      const logo = attrs["tvg-logo"] || "";
      channels.push({ name, country, logo, url: next });
    }
  }
  return channels;
}

// =============== UI BUILDERS ===============
function groupByCountry(channels) {
  const map = {};
  channels.forEach((c) => {
    (map[c.country] = map[c.country] || []).push(c);
  });
  return map;
}

function renderCountries() {
  countryList.innerHTML = "";
  countrySelect.innerHTML = '<option value="">All Countries</option>';
  Object.keys(grouped)
    .sort()
    .forEach((c) => {
      const div = document.createElement("div");
      div.className = "country-item";
      div.textContent = `${c} (${grouped[c].length})`;
      div.onclick = () => {
        document.querySelectorAll(".country-item").forEach((x) => x.classList.remove("active"));
        div.classList.add("active");
        countrySelect.value = c;
        renderChannels();
      };
      countryList.appendChild(div);

      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });
}

function renderChannels() {
  grid.innerHTML = "";
  const search = searchInput.value.toLowerCase();
  const country = countrySelect.value;
  const list = all.filter(
    (ch) =>
      (!country || ch.country === country) &&
      (ch.name.toLowerCase().includes(search) || ch.country.toLowerCase().includes(search))
  );

  sectionTitle.textContent = country || "All Channels";

  list.forEach((ch) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${ch.logo || "https://via.placeholder.com/300x150?text=No+Logo"}" alt="${ch.name}">
      <h3>${ch.name}</h3>
      <p style="font-size:0.8em;color:#999">${ch.country}</p>`;
    card.onclick = () => play(ch);
    grid.appendChild(card);
  });

  if (!list.length) grid.innerHTML = "<p>No channels found.</p>";
}

// =============== PLAYER ===============
function play(ch) {
  nowPlaying.textContent = `${ch.name} (${ch.country})`;
  modal.classList.remove("hidden");

  if (Hls.isSupported()) {
    if (currentHls) currentHls.destroy();
    currentHls = new Hls();
    currentHls.loadSource(ch.url);
    currentHls.attachMedia(video);
    currentHls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  } else {
    video.src = ch.url;
    video.play();
  }
}

closeBtn.onclick = () => {
  modal.classList.add("hidden");
  video.pause();
  if (currentHls) currentHls.destroy();
};

// =============== LOAD DATA ===============
async function loadAll() {
  try {
    const mode = contentMode.value;
    let safe = [],
      nsfw = [];
    if (mode === "safe" || mode === "both") {
      const s = await loadM3U(M3U_SAFE);
      safe = parseM3U(s);
    }
    if (mode === "nsfw" || mode === "both") {
      const n = await loadM3U(M3U_NSFW);
      nsfw = parseM3U(n);
    }
    all = [...safe, ...nsfw];
    grouped = groupByCountry(all);
    renderCountries();
    renderChannels();
  } catch (e) {
    grid.innerHTML = `<p style="color:red;">Error loading channels. Try refreshing.</p>`;
    console.error(e);
  }
}

// =============== EVENTS ===============
searchInput.oninput = () => renderChannels();
countrySelect.onchange = () => renderChannels();
contentMode.onchange = () => loadAll();

// START
loadAll();
