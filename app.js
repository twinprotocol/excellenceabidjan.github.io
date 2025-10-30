const API_URL = "https://api.allorigins.win/raw?url=https://iptv-org.github.io/api/channels.json";

const categoriesContainer = document.getElementById("categories");
const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const playerContainer = document.getElementById("playerContainer");
const player = document.getElementById("player");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function loadChannels() {
  categoriesContainer.innerHTML = "<p style='text-align:center;color:#999;font-size:1.2em;'>Loading channels...</p>";
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    allChannels = data.filter(ch => ch.url && ch.name);

    // Categories by category field or fallback to "Other"
    const categoriesMap = {};
    allChannels.forEach(ch => {
      const cat = ch.category || "Other";
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(ch);
    });

    renderCategories(categoriesMap);

    const countries = [...new Set(allChannels.map(c => c.country).filter(Boolean))].sort();
    countrySelect.innerHTML = `<option value="">🌍 All Countries</option>` +
      countries.map(c => `<option value="${c}">${c}</option>`).join("");

  } catch (e) {
    console.error(e);
    categoriesContainer.innerHTML = "<p style='text-align:center;color:red;'>⚠️ Failed to load channels. Check your internet connection.</p>";
  }
}

function renderCategories(categoriesMap) {
  categoriesContainer.innerHTML = "";
  for (const [catName, channels] of Object.entries(categoriesMap)) {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `<h3>${catName}</h3><div class="channels-grid"></div>`;
    const grid = row.querySelector(".channels-grid");

    channels.forEach(ch => {
      const div = document.createElement("div");
      div.className = "channel";
      div.innerHTML = `
        <img src="${ch.logo || 'https://via.placeholder.com/160x90?text=No+Logo'}" alt="${ch.name}">
        <p>${ch.name}</p>
      `;
      div.onclick = () => playChannel(ch.url_resolved || ch.url);
      grid.appendChild(div);
    });

    categoriesContainer.appendChild(row);
  }
}

function playChannel(url) {
  player.src = url;
  playerContainer.classList.remove("hidden");
  player.play();
}

closePlayer.onclick = () => {
  player.pause();
  playerContainer.classList.add("hidden");
};

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = allChannels.filter(ch => ch.name.toLowerCase().includes(term));
  const categoriesMap = {};
  filtered.forEach(ch => {
    const cat = ch.category || "Other";
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(ch);
  });
  renderCategories(categoriesMap);
});

countrySelect.addEventListener("change", () => {
  const val = countrySelect.value;
  const filtered = val ? allChannels.filter(ch => ch.country === val) : allChannels;
  const categoriesMap = {};
  filtered.forEach(ch => {
    const cat = ch.category || "Other";
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(ch);
  });
  renderCategories(categoriesMap);
});

loadChannels();
