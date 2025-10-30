const SAFE_URL = "https://iptv-org.github.io/api/channels.json";
const NSFW_URL = "https://iptv-org.github.io/api/nsfw.json";

const channelsContainer = document.getElementById("channels");
const searchInput = document.getElementById("search");
const countrySelect = document.getElementById("countrySelect");
const playerContainer = document.getElementById("playerContainer");
const player = document.getElementById("player");
const closePlayer = document.getElementById("closePlayer");

let allChannels = [];

async function loadChannels() {
  try {
    const [safeRes, nsfwRes] = await Promise.all([
      fetch(SAFE_URL),
      fetch(NSFW_URL)
    ]);

    const safeChannels = await safeRes.json();
    const nsfwChannels = await nsfwRes.json();

    allChannels = [...safeChannels, ...nsfwChannels].filter(c => c.url && c.name);

    const countries = [...new Set(allChannels.map(c => c.country).filter(Boolean))].sort();
    countrySelect.innerHTML = `<option value="">All countries</option>` +
      countries.map(c => `<option value="${c}">${c}</option>`).join("");

    renderChannels(allChannels);
  } catch (e) {
    console.error("Error loading channels:", e);
    channelsContainer.innerHTML = "<p>⚠️ Failed to load channels (network or CORS blocked).</p>";
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
