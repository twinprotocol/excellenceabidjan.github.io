const SAFE_URL = "https://api.allorigins.win/raw?url=https://iptv-org.github.io/api/channels.json";

const channelsContainer = document.getElementById("channels");
const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const playerContainer = document.getElementById("playerContainer");
const player = document.getElementById("player");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function loadChannels() {
  try {
    channelsContainer.innerHTML = "<p style='text-align:center;color:#888;'>Initializing...</p>";

    const res = await fetch(SAFE_URL);
    const channels = await res.json();

    allChannels = channels.filter(ch => ch.url && ch.name);

    const countries = [...new Set(allChannels.map(c => c.country).filter(Boolean))].sort();
    countrySelect.innerHTML = `<option value="">All countries</option>` +
      countries.map(c => `<option value="${c}">${c}</option>`).join("");

    renderChannels(allChannels);
  } catch (e) {
    console.error(e);
    channelsContainer.innerHTML = "<p style='text-align:center;color:red;'>⚠️ Failed to load channels. Check your internet connection.</p>";
  }
}

function renderChannels(list) {
  channelsContainer.innerHTML = "";
  list.forEach(ch => {
    const div = document.createElement("div");
    div.className = "channel";
    div.innerHTML = `
      <img src="${ch.logo || 'https://via.placeholder.com/160x90?text=No+Logo'}" alt="${ch.name}">
      <p>${ch.name}</p>
    `;
    div.onclick = () => playChannel(ch.url_resolved || ch.url);
    channelsContainer.appendChild(div);
  });
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
  renderChannels(filtered);
});

countrySelect.addEventListener("change", () => {
  const val = countrySelect.value;
  const filtered = val ? allChannels.filter(ch => ch.country === val) : allChannels;
  renderChannels(filtered);
});

loadChannels();
