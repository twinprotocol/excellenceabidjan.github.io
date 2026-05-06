const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const todayKey = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = "makewaves-erp-v1";
const today = new Date().toISOString().slice(0, 10);
let installPrompt = null;

const art = (kind, primary, secondary) => {
  const icons = {
    piano: '<rect x="35" y="122" width="250" height="48" rx="10" fill="#151922"/><rect x="55" y="132" width="210" height="26" rx="4" fill="#fff"/><g fill="#151922"><rect x="72" y="132" width="8" height="17"/><rect x="102" y="132" width="8" height="17"/><rect x="132" y="132" width="8" height="17"/><rect x="177" y="132" width="8" height="17"/><rect x="207" y="132" width="8" height="17"/></g><path d="M90 120c12-52 74-73 124-47 30 16 54 35 81 18-8 34-36 53-77 50l-128-21Z" fill="#262b36"/>',
    guitar: '<path d="M142 54h78l-44 92c13 19 9 47-11 63-24 19-61 13-78-14-13-22-9-51 11-68l44-73Z" fill="#f4c36a"/><path d="M209 45l52-30 12 21-51 31Z" fill="#2c3340"/><circle cx="137" cy="164" r="25" fill="#1b202b"/><path d="M129 71l79 137" stroke="#1b202b" stroke-width="5"/>',
    drums: '<ellipse cx="116" cy="96" rx="58" ry="20" fill="#ffffff"/><rect x="58" y="96" width="116" height="72" fill="#c71931"/><ellipse cx="116" cy="168" rx="58" ry="20" fill="#831424"/><circle cx="220" cy="124" r="34" fill="#222a36"/><ellipse cx="220" cy="124" rx="34" ry="12" fill="#fff"/><path d="M53 65h90M232 64h58" stroke="#222a36" stroke-width="8" stroke-linecap="round"/>',
    brass: '<path d="M64 150c55 6 98-14 128-55l37-50 23 13-34 59c-35 60-94 78-157 60Z" fill="#d59c32"/><circle cx="252" cy="58" r="34" fill="#efc05b"/><circle cx="252" cy="58" r="17" fill="#f8df9d"/><path d="M118 112c15-18 36-21 53-11" stroke="#875f16" stroke-width="10" fill="none"/>',
    audio: '<rect x="70" y="45" width="180" height="165" rx="14" fill="#202733"/><circle cx="160" cy="106" r="42" fill="#3b4657"/><circle cx="160" cy="106" r="20" fill="#121721"/><circle cx="160" cy="172" r="22" fill="#c71931"/><rect x="105" y="62" width="110" height="10" rx="5" fill="#eef2f8"/>',
    accessory: '<rect x="66" y="64" width="188" height="128" rx="18" fill="#2e3542"/><path d="M96 97h128M96 128h128M96 159h84" stroke="#fff" stroke-width="14" stroke-linecap="round"/><circle cx="221" cy="158" r="18" fill="#c71931"/>'
  };
const state = loadState();
const els = {};

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs><rect width="320" height="240" fill="url(#bg)"/><circle cx="45" cy="45" r="24" fill="#fff" opacity=".24"/><circle cx="278" cy="198" r="54" fill="#fff" opacity=".14"/>${icons[kind]}<text x="24" y="218" font-family="Arial" font-size="22" font-weight="800" fill="#fff">YAMAHA</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
const currencyMeta = {
  XOF: { label: "Franc CFA", suffix: "FCFA" },
  DZD: { label: "Dinar", suffix: "DZD" }
};

const seedProducts = [
  { id: "p1", name: "Yamaha CFX Concert Grand", category: "Keyboards", condition: "New", price: 18999, stock: 2, image: art("piano", "#263241", "#7f1525"), details: "Premium acoustic grand piano for studios, venues, and serious performers." },
  { id: "p2", name: "Yamaha P-225 Digital Piano", category: "Keyboards", condition: "New", price: 899, stock: 8, image: art("piano", "#145ca8", "#1d2937"), details: "Compact weighted-key digital piano with clean everyday tone." },
  { id: "p3", name: "Yamaha FG800 Acoustic Guitar", category: "Guitars", condition: "New", price: 229, stock: 14, image: art("guitar", "#9e1024", "#d7922a"), details: "Solid-top acoustic guitar, reliable for lessons, practice, and stage use." },
  { id: "p4", name: "Yamaha Revstar Element", category: "Guitars", condition: "New", price: 549, stock: 5, image: art("guitar", "#0b7b59", "#222a36"), details: "Modern electric guitar with punchy pickups and comfortable balance." },
  { id: "p5", name: "Yamaha Stage Custom Birch", category: "Drums", condition: "New", price: 799, stock: 3, image: art("drums", "#c71931", "#222a36"), details: "Birch shell drum kit with clear attack for rehearsals and live rooms." },
  { id: "p6", name: "Yamaha YTR-2330 Trumpet", category: "Brass & Woodwind", condition: "New", price: 649, stock: 4, image: art("brass", "#b67816", "#724815"), details: "Student trumpet with easy response and durable build." },
  { id: "p7", name: "Yamaha HS8 Studio Monitor", category: "Audio", condition: "New", price: 399, stock: 7, image: art("audio", "#202733", "#596575"), details: "Accurate powered monitor for production, mixing, and shop demos." },
  { id: "p8", name: "Yamaha Keyboard Stand", category: "Accessories", condition: "New", price: 79, stock: 18, image: art("accessory", "#6f7a89", "#111823"), details: "Stable folding stand for digital pianos and stage keyboards." }
];
function fallbackImage(name, category) {
  const palette = {
    Keyboards: ["#07151f", "#00a6a6"],
    Guitars: ["#842f5b", "#f05d5e"],
    Drums: ["#263238", "#ffc857"],
    Audio: ["#1b3553", "#2fbf71"],
    Accessories: ["#39424e", "#9bd8d8"],
    "Spare Parts": ["#4a4f59", "#f7ba45"]
  };
  const colors = palette[category] || palette.Accessories;
  const initials = name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="320" height="240" fill="url(#g)"/><path d="M0 170 C70 120 130 210 200 160 S285 115 320 145 V240 H0Z" fill="#fff" opacity=".18"/><circle cx="258" cy="60" r="42" fill="#fff" opacity=".18"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="54" font-weight="900" fill="#fff">${initials}</text><text x="24" y="218" font-family="Arial" font-size="20" font-weight="900" fill="#fff">MAKEWAVES</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const store = {
  products: load("yamaha-products", seedProducts),
  cart: load("yamaha-cart", []),
  invoices: load("yamaha-invoices", []),
  buybacks: load("yamaha-buybacks", [])
};
function demoState() {
  const products = [
    product("Yamaha PSR-SX900", "Keyboards", 900000, 640000, 4, "KB-SX900", "Arranger workstation for performance and studio use."),
    product("Yamaha P-125A Digital Piano", "Keyboards", 430000, 310000, 7, "KB-P125A", "Weighted digital piano for home, school, and stage."),
    product("Yamaha FG800 Acoustic Guitar", "Guitars", 145000, 89000, 12, "GT-FG800", "Solid-top acoustic guitar with balanced tone."),
    product("Yamaha Pacifica 112V", "Guitars", 265000, 182000, 5, "GT-PAC112", "Versatile electric guitar for modern players."),
    product("Yamaha Stage Custom Birch", "Drums", 650000, 480000, 2, "DR-SCB", "Birch acoustic drum kit for live and rehearsal rooms."),
    product("Yamaha HS8 Monitor", "Audio", 260000, 190000, 6, "AU-HS8", "Studio monitor for accurate mixing and production."),
    product("Sustain Pedal", "Accessories", 25000, 11000, 25, "AC-PEDAL", "Universal sustain pedal for keyboards."),
    product("Keyboard Power Adapter", "Spare Parts", 18000, 7000, 3, "SP-ADAPT", "Replacement adapter for Yamaha keyboards.")
  ];

const els = {
  productGrid: document.querySelector("#productGrid"),
  categoryFilter: document.querySelector("#categoryFilter"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  cartList: document.querySelector("#cartList"),
  checkoutForm: document.querySelector("#checkoutForm"),
  subtotalValue: document.querySelector("#subtotalValue"),
  discountInput: document.querySelector("#discountInput"),
  cashReceived: document.querySelector("#cashReceived"),
  changeValue: document.querySelector("#changeValue"),
  invoiceDialog: document.querySelector("#invoiceDialog"),
  invoiceSheet: document.querySelector("#invoiceSheet"),
  buybackForm: document.querySelector("#buybackForm"),
  buybackList: document.querySelector("#buybackList"),
  invoiceList: document.querySelector("#invoiceList"),
  stockList: document.querySelector("#stockList"),
  statSales: document.querySelector("#statSales"),
  statStock: document.querySelector("#statStock"),
  statCart: document.querySelector("#statCart"),
  statBuybacks: document.querySelector("#statBuybacks")
};
  return {
    currency: "XOF",
    products,
    cart: [],
    sales: [],
    repairs: [
      {
        id: uid("REP"),
        client: "Studio Atlas",
        instrument: "Yamaha MG12XU Mixer",
        technician: "Karim",
        problem: "One channel has noise and the USB output drops.",
        estimate: 45000,
        status: "Diagnosing",
        date: today
      }
    ],
    purchases: [],
    customers: [
      { id: uid("CUS"), name: "Studio Atlas", phone: "+213 555 100 200", segment: "Studio", notes: "Often asks for audio equipment and repair service." },
      { id: uid("CUS"), name: "Ecole Harmonie", phone: "+213 555 220 300", segment: "School", notes: "Keyboard and guitar lessons, prefers school pricing." }
    ]
  };
}

function load(key, fallback) {
function product(name, category, price, cost, stock, sku, details) {
  return {
    id: uid("PRD"),
    name,
    category,
    price,
    cost,
    stock,
    sku,
    details,
    image: fallbackImage(name, category),
    created: today
  };
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || demoState();
  } catch {
    return fallback;
    return demoState();
  }
}

function save() {
  localStorage.setItem("yamaha-products", JSON.stringify(store.products));
  localStorage.setItem("yamaha-cart", JSON.stringify(store.cart));
  localStorage.setItem("yamaha-invoices", JSON.stringify(store.invoices));
  localStorage.setItem("yamaha-buybacks", JSON.stringify(store.buybacks));
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  const amount = Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  return `${amount} ${currencyMeta[state.currency].suffix}`;
}

function byId(id) {
  return document.getElementById(id);
}

function cacheElements() {
  [
    "currencySelect", "screenTitle", "todaySales", "inventoryValue", "openRepairs", "lowStockCount",
    "activityList", "repairQueue", "saleSearch", "saleCategory", "saleProductList", "cartTable",
    "saleTotal", "saleDiscount", "saleClient", "salePhone", "saleStatus", "saleNotes", "saleForm",
    "productForm", "productName", "productCategory", "productPrice", "productCost", "productStock",
    "productSku", "productImage", "productDetails", "productSearch", "inventoryGrid", "repairForm",
    "repairClient", "repairInstrument", "repairTech", "repairProblem", "repairEstimate", "repairStatus",
    "ticketList", "purchaseForm", "supplierName", "purchaseProduct", "purchaseQty", "purchaseCost",
    "purchaseList", "customerForm", "customerName", "customerPhone", "customerSegment", "customerNotes",
    "customerList", "customerNames", "reportGrid", "invoiceDialog", "invoiceContent", "installBtn"
  ].forEach((id) => {
    els[id] = byId(id);
  });
}

function emptyNode() {
  return document.querySelector("#emptyTemplate").content.cloneNode(true);
  return byId("emptyTemplate").content.cloneNode(true);
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  document.querySelectorAll(".nav-btn").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  els.screenTitle.textContent = document.querySelector(`[data-view="${view}"]`).textContent;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCategories() {
  const categories = [...new Set(store.products.map((product) => product.category))].sort();
  els.categoryFilter.innerHTML = '<option value="All">All products</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  });
function productCategories() {
  return ["All", ...new Set(state.products.map((item) => item.category))];
}

function renderProducts() {
  const term = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  let products = store.products.filter((product) => {
    const matchesTerm = [product.name, product.category, product.condition, product.details].join(" ").toLowerCase().includes(term);
    const matchesCategory = category === "All" || product.category === category;
    return matchesTerm && matchesCategory;
function renderSelectors() {
  const categoryOptions = productCategories().map((category) => `<option>${category}</option>`).join("");
  els.saleCategory.innerHTML = categoryOptions;
  els.purchaseProduct.innerHTML = state.products.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  els.customerNames.innerHTML = state.customers.map((item) => `<option value="${item.name}"></option>`).join("");
  els.currencySelect.value = state.currency;
}

function renderDashboard() {
  const todayTotal = state.sales.filter((sale) => sale.date === today).reduce((sum, sale) => sum + sale.total, 0);
  const inventoryValue = state.products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const openRepairs = state.repairs.filter((ticket) => ticket.status !== "Delivered").length;
  const lowStock = state.products.filter((item) => item.stock <= 3).length;

  els.todaySales.textContent = money(todayTotal);
  els.inventoryValue.textContent = money(inventoryValue);
  els.openRepairs.textContent = openRepairs;
  els.lowStockCount.textContent = lowStock;

  const activities = [
    ...state.sales.slice(-5).map((sale) => ({ title: `Sale ${sale.id}`, meta: `${sale.client || "Walk-in client"} - ${sale.items.length} item(s)`, value: money(sale.total) })),
    ...state.purchases.slice(-3).map((purchase) => ({ title: `Purchase from ${purchase.supplier}`, meta: `${purchase.qty} received`, value: money(purchase.total) }))
  ].reverse();
  renderActivity(els.activityList, activities);

  const queue = state.repairs.filter((ticket) => ticket.status !== "Delivered").slice(0, 5).map((ticket) => ({
    title: ticket.instrument,
    meta: `${ticket.client} - ${ticket.status}`,
    value: money(ticket.estimate)
  }));
  renderActivity(els.repairQueue, queue);
}

function renderActivity(container, items) {
  container.innerHTML = "";
  if (!items.length) {
    container.append(emptyNode());
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "activity-card";
    card.innerHTML = `<div><strong>${item.title}</strong><div class="card-meta">${item.meta}</div></div><b>${item.value}</b>`;
    container.append(card);
  });
}

  products = products.sort((a, b) => {
    if (els.sortSelect.value === "priceLow") return a.price - b.price;
    if (els.sortSelect.value === "priceHigh") return b.price - a.price;
    if (els.sortSelect.value === "stock") return b.stock - a.stock;
    return a.id.localeCompare(b.id);
function renderSaleProducts() {
  const term = els.saleSearch.value.trim().toLowerCase();
  const category = els.saleCategory.value || "All";
  const products = state.products.filter((item) => {
    const text = `${item.name} ${item.category} ${item.sku} ${item.details}`.toLowerCase();
    return text.includes(term) && (category === "All" || item.category === category);
  });

  els.productGrid.innerHTML = "";
  els.saleProductList.innerHTML = "";
  if (!products.length) {
    els.productGrid.append(emptyNode());
    els.saleProductList.append(emptyNode());
    return;
  }

  products.forEach((product) => {
    const stockClass = product.stock === 0 ? "stock-out" : product.stock <= 3 ? "stock-low" : "";
  products.forEach((item) => {
    const badge = item.stock <= 0 ? "bad" : item.stock <= 3 ? "warn" : "";
    const card = document.createElement("article");
    card.className = "product-card";
    card.className = "pick-card";
    card.innerHTML = `
      <img class="product-art" src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <div class="product-title">
          <h3>${product.name}</h3>
          <span class="price">${money.format(product.price)}</span>
        </div>
        <p class="product-meta">${product.details}</p>
        <div class="badge-row">
          <span class="badge">${product.category}</span>
          <span class="badge">${product.condition}</span>
          <span class="badge ${stockClass}">${product.stock} in stock</span>
        </div>
        <button class="primary-button" type="button" ${product.stock === 0 ? "disabled" : ""} data-add="${product.id}">Add to Cart</button>
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <div class="card-meta">${item.sku || "No SKU"} - ${money(item.price)}</div>
        <div class="badge-row"><span class="badge">${item.category}</span><span class="badge ${badge}">${item.stock} stock</span></div>
        <div class="card-actions"><button class="small-btn" data-add-cart="${item.id}" ${item.stock <= 0 ? "disabled" : ""} type="button">Add</button></div>
      </div>
    `;
    els.productGrid.append(card);
    els.saleProductList.append(card);
  });
}

function cartSubtotal() {
  return store.cart.reduce((sum, item) => {
    const product = store.products.find((candidate) => candidate.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function renderCart() {
  els.cartList.innerHTML = "";
  if (!store.cart.length) {
    els.cartList.append(emptyNode());
  } else {
    store.cart.forEach((item) => {
      const product = store.products.find((candidate) => candidate.id === item.id);
      if (!product) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <strong>${product.name}</strong>
          <div class="record-meta">${money.format(product.price)} each &middot; ${product.stock} available</div>
        </div>
        <div class="cart-controls">
          <button class="icon-button" type="button" title="Decrease" data-dec="${product.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="icon-button" type="button" title="Increase" data-inc="${product.id}">+</button>
          <button class="icon-button" type="button" title="Remove" data-remove="${product.id}">x</button>
        </div>
      `;
      els.cartList.append(row);
    });
  els.cartTable.innerHTML = "";
  if (!state.cart.length) {
    els.cartTable.append(emptyNode());
    els.saleTotal.textContent = money(0);
    return;
  }
  updateMoney();
  const header = document.createElement("div");
  header.className = "cart-row header";
  header.innerHTML = "<span>Product</span><span>Price</span><span>Qty</span><span>Total</span><span></span>";
  els.cartTable.append(header);

  state.cart.forEach((line) => {
    const item = state.products.find((productItem) => productItem.id === line.productId);
    if (!item) return;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <strong>${item.name}</strong>
      <input data-cart-price="${line.productId}" type="number" min="0" step="1" value="${line.price}" aria-label="Editable price for ${item.name}">
      <input data-cart-qty="${line.productId}" type="number" min="1" max="${item.stock}" step="1" value="${line.qty}" aria-label="Quantity for ${item.name}">
      <b>${money(line.price * line.qty)}</b>
      <button class="small-btn danger" data-cart-remove="${line.productId}" type="button">Remove</button>
    `;
    els.cartTable.append(row);
  });
  updateSaleTotal();
}

function updateMoney() {
  const subtotal = cartSubtotal();
  const discount = Number(els.discountInput.value || 0);
  const total = Math.max(0, subtotal - discount);
  const cash = Number(els.cashReceived.value || 0);
  els.subtotalValue.textContent = money.format(subtotal);
  els.changeValue.textContent = money.format(Math.max(0, cash - total));
  els.statCart.textContent = money.format(total);
function updateSaleTotal() {
  const subtotal = state.cart.reduce((sum, line) => sum + line.price * line.qty, 0);
  const discount = Number(els.saleDiscount.value || 0);
  els.saleTotal.textContent = money(Math.max(0, subtotal - discount));
}

function renderRecords() {
  els.buybackList.innerHTML = "";
  els.invoiceList.innerHTML = "";
  els.stockList.innerHTML = "";
function renderInventory() {
  const term = els.productSearch.value.trim().toLowerCase();
  const products = state.products.filter((item) => `${item.name} ${item.category} ${item.sku}`.toLowerCase().includes(term));
  els.inventoryGrid.innerHTML = "";
  if (!products.length) {
    els.inventoryGrid.append(emptyNode());
    return;
  }
  products.forEach((item) => {
    const card = document.createElement("article");
    card.className = "inventory-card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <div class="card-meta">${item.details || "No extra details"}</div>
        <div class="badge-row">
          <span class="badge">${item.category}</span>
          <span class="badge">${item.sku || "No SKU"}</span>
          <span class="badge ${item.stock <= 3 ? "warn" : ""}">${item.stock} in stock</span>
          <span class="badge">${money(item.price)}</span>
        </div>
      </div>
    `;
    els.inventoryGrid.append(card);
  });
}

  if (!store.buybacks.length) {
    els.buybackList.append(emptyNode());
  } else {
    store.buybacks.slice().reverse().forEach((entry) => {
      const row = document.createElement("div");
      row.className = "record-item";
      row.innerHTML = `<div><strong>${entry.instrument}</strong><div class="record-meta">${entry.seller} &middot; ${entry.condition} &middot; ${entry.date}</div></div><b>${money.format(entry.buyPrice)}</b>`;
      els.buybackList.append(row);
    });
function renderRepairs() {
  els.ticketList.innerHTML = "";
  if (!state.repairs.length) {
    els.ticketList.append(emptyNode());
    return;
  }
  state.repairs.slice().reverse().forEach((ticket) => {
    const card = document.createElement("article");
    card.className = "ticket-card";
    card.innerHTML = `
      <div>
        <h3>${ticket.instrument}</h3>
        <div class="card-meta">${ticket.client} - ${ticket.technician || "No technician"} - ${ticket.date}</div>
        <p class="subtle">${ticket.problem}</p>
        <strong>${money(ticket.estimate)}</strong>
      </div>
      <select data-repair-status="${ticket.id}">
        ${["Received", "Diagnosing", "Waiting parts", "Repairing", "Ready", "Delivered"].map((status) => `<option ${status === ticket.status ? "selected" : ""}>${status}</option>`).join("")}
      </select>
    `;
    els.ticketList.append(card);
  });
}

  if (!store.invoices.length) {
    els.invoiceList.append(emptyNode());
  } else {
    store.invoices.slice().reverse().forEach((invoice) => {
      const row = document.createElement("button");
      row.className = "record-item";
      row.type = "button";
      row.dataset.invoice = invoice.id;
      row.innerHTML = `<div><strong>${invoice.id}</strong><div class="record-meta">${invoice.client.name} &middot; ${invoice.date}</div></div><b>${money.format(invoice.total)}</b>`;
      els.invoiceList.append(row);
    });
function renderPurchases() {
  const items = state.purchases.slice().reverse().map((purchase) => {
    const productItem = state.products.find((item) => item.id === purchase.productId);
    return {
      title: purchase.supplier,
      meta: `${productItem ? productItem.name : "Deleted product"} - ${purchase.qty} units - ${purchase.date}`,
      value: money(purchase.total)
    };
  });
  renderActivity(els.purchaseList, items);
}

function renderCustomers() {
  els.customerList.innerHTML = "";
  if (!state.customers.length) {
    els.customerList.append(emptyNode());
    return;
  }
  state.customers.forEach((customer) => {
    const salesTotal = state.sales.filter((sale) => sale.client === customer.name).reduce((sum, sale) => sum + sale.total, 0);
    const card = document.createElement("article");
    card.className = "customer-card";
    card.innerHTML = `
      <div>
        <h3>${customer.name}</h3>
        <div class="card-meta">${customer.phone || "No phone"} - ${customer.segment}</div>
        <p class="subtle">${customer.notes || "No notes"}</p>
      </div>
      <strong>${money(salesTotal)}</strong>
    `;
    els.customerList.append(card);
  });
}

  const lowStock = store.products.filter((product) => product.stock <= 3);
  if (!lowStock.length) {
    els.stockList.append(emptyNode());
  } else {
    lowStock.forEach((product) => {
      const row = document.createElement("div");
      row.className = "stock-item";
      row.innerHTML = `<div><strong>${product.name}</strong><div class="record-meta">${product.category}</div></div><b>${product.stock} left</b>`;
      els.stockList.append(row);
    });
  }
function renderReports() {
  const salesTotal = state.sales.reduce((sum, sale) => sum + sale.total, 0);
  const profit = state.sales.reduce((sum, sale) => {
    const cost = sale.items.reduce((itemSum, line) => itemSum + (line.cost || 0) * line.qty, 0);
    return sum + sale.total - cost;
  }, 0);
  const stockUnits = state.products.reduce((sum, item) => sum + item.stock, 0);
  const repairValue = state.repairs.reduce((sum, ticket) => sum + Number(ticket.estimate || 0), 0);
  const cards = [
    ["Sales revenue", money(salesTotal)],
    ["Estimated gross profit", money(profit)],
    ["Stock units", stockUnits],
    ["Repair pipeline", money(repairValue)],
    ["Customers", state.customers.length],
    ["Products", state.products.length]
  ];
  els.reportGrid.innerHTML = cards.map(([label, value]) => `<article class="report-card"><span class="card-meta">${label}</span><strong>${value}</strong></article>`).join("");
}

function updateStats() {
  const todaySales = store.invoices.filter((invoice) => invoice.date.startsWith(todayKey)).reduce((sum, invoice) => sum + invoice.total, 0);
  els.statSales.textContent = money.format(todaySales);
  els.statStock.textContent = store.products.reduce((sum, product) => sum + product.stock, 0);
  els.statBuybacks.textContent = store.buybacks.length;
function renderAll() {
  renderSelectors();
  renderDashboard();
  renderSaleProducts();
  renderCart();
  renderInventory();
  renderRepairs();
  renderPurchases();
  renderCustomers();
  renderReports();
}

function addToCart(id) {
  const product = store.products.find((candidate) => candidate.id === id);
  if (!product || product.stock <= 0) return;
  const item = store.cart.find((candidate) => candidate.id === id);
  if (item) {
    if (item.qty < product.stock) item.qty += 1;
function addToCart(productId) {
  const productItem = state.products.find((item) => item.id === productId);
  if (!productItem || productItem.stock <= 0) return;
  const existing = state.cart.find((line) => line.productId === productId);
  if (existing) {
    existing.qty = Math.min(productItem.stock, existing.qty + 1);
  } else {
    store.cart.push({ id, qty: 1 });
    state.cart.push({ productId, price: productItem.price, qty: 1 });
  }
  save();
  saveState();
  renderCart();
  renderProducts();
}

function changeQuantity(id, delta) {
  const product = store.products.find((candidate) => candidate.id === id);
  const item = store.cart.find((candidate) => candidate.id === id);
  if (!product || !item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    store.cart = store.cart.filter((candidate) => candidate.id !== id);
function saveSale(event) {
  event.preventDefault();
  if (!state.cart.length) {
    alert("Add at least one product to the sale.");
    return;
  }
  if (item.qty > product.stock) item.qty = product.stock;
  save();
  renderCart();
  const items = state.cart.map((line) => {
    const productItem = state.products.find((item) => item.id === line.productId);
    return {
      productId: line.productId,
      name: productItem.name,
      sku: productItem.sku,
      cost: productItem.cost,
      price: line.price,
      qty: line.qty
    };
  });
  const subtotal = items.reduce((sum, line) => sum + line.price * line.qty, 0);
  const discount = Number(els.saleDiscount.value || 0);
  const sale = {
    id: uid("SAL"),
    date: today,
    createdAt: new Date().toLocaleString(),
    client: els.saleClient.value.trim() || "Walk-in client",
    phone: els.salePhone.value.trim(),
    status: els.saleStatus.value,
    notes: els.saleNotes.value.trim(),
    items,
    discount,
    total: Math.max(0, subtotal - discount)
  };

  items.forEach((line) => {
    const productItem = state.products.find((item) => item.id === line.productId);
    productItem.stock -= line.qty;
  });
  ensureCustomer(sale.client, sale.phone);
  state.sales.push(sale);
  state.cart = [];
  els.saleForm.reset();
  els.saleDiscount.value = 0;
  saveState();
  buildInvoice(sale);
  els.invoiceDialog.showModal();
  renderAll();
}

function buildInvoice(invoice) {
  const rows = invoice.items.map((item) => `
function ensureCustomer(name, phone) {
  if (!name || name === "Walk-in client") return;
  const existing = state.customers.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    if (phone && !existing.phone) existing.phone = phone;
    return;
  }
  state.customers.push({ id: uid("CUS"), name, phone, segment: "Retail", notes: "Created from sale." });
}

function buildInvoice(sale) {
  const rows = sale.items.map((line) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${money.format(item.price)}</td>
      <td>${money.format(item.price * item.qty)}</td>
      <td>${line.name}<br><span class="card-meta">${line.sku || ""}</span></td>
      <td>${line.qty}</td>
      <td>${money(line.price)}</td>
      <td>${money(line.price * line.qty)}</td>
    </tr>
  `).join("");

  els.invoiceSheet.innerHTML = `
    <div class="invoice-header">
  const subtotal = sale.items.reduce((sum, line) => sum + line.price * line.qty, 0);
  els.invoiceContent.innerHTML = `
    <div class="invoice-head">
      <div>
        <h2>Yamaha Musical Instrument Shop</h2>
        <p>Cash sales and instrument buyback desk</p>
        <p>Payment: <strong>Cash only</strong></p>
        <h2>MAKEWAVES ERP</h2>
        <p>Yamaha musical shop - sales invoice</p>
      </div>
      <div>
        <strong>Invoice ${invoice.id}</strong>
        <p>${invoice.date}</p>
        <strong>${sale.id}</strong>
        <p>${sale.createdAt}</p>
      </div>
    </div>
    <p><strong>Client:</strong> ${invoice.client.name}<br><strong>Phone:</strong> ${invoice.client.phone || "Not provided"}<br><strong>Address:</strong> ${invoice.client.address || "Not provided"}</p>
    <p><strong>Client:</strong> ${sale.client}<br><strong>Phone:</strong> ${sale.phone || "Not provided"}<br><strong>Status:</strong> ${sale.status}</p>
    <table class="invoice-table">
      <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="invoice-total-row"><span>Subtotal</span><strong>${money.format(invoice.subtotal)}</strong></div>
    <div class="invoice-total-row"><span>Discount</span><strong>${money.format(invoice.discount)}</strong></div>
    <div class="invoice-total-row grand"><span>Total paid</span><strong>${money.format(invoice.total)}</strong></div>
    <div class="invoice-total-row"><span>Cash received</span><strong>${money.format(invoice.cashReceived)}</strong></div>
    <div class="invoice-total-row"><span>Change</span><strong>${money.format(invoice.change)}</strong></div>
    <p class="fine-print">Thank you for your purchase. Please keep this invoice for service, exchange, and warranty reference.</p>
    <div class="invoice-totals">
      <div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <div><span>Discount</span><strong>${money(sale.discount)}</strong></div>
      <div class="grand"><span>Total</span><strong>${money(sale.total)}</strong></div>
    </div>
    <p class="subtle">Prices may be adjusted per client. Keep this invoice for warranty, exchange, or maintenance follow-up.</p>
  `;
}

function createInvoice(event) {
function readImage(input) {
  return new Promise((resolve) => {
    const file = input.files && input.files[0];
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function saveProduct(event) {
  event.preventDefault();
  if (!store.cart.length) {
    alert("Add at least one product to the cart before creating an invoice.");
    return;
  }
  const subtotal = cartSubtotal();
  const discount = Number(els.discountInput.value || 0);
  const total = Math.max(0, subtotal - discount);
  const cashReceived = Number(els.cashReceived.value || 0);
  if (cashReceived < total) {
    alert("Cash received must cover the full invoice total.");
    return;
  }

  const invoice = {
    id: `INV-${Date.now().toString().slice(-7)}`,
    date: new Date().toLocaleString(),
    client: {
      name: document.querySelector("#clientName").value.trim(),
      phone: document.querySelector("#clientPhone").value.trim(),
      address: document.querySelector("#clientAddress").value.trim()
    },
    items: store.cart.map((item) => {
      const product = store.products.find((candidate) => candidate.id === item.id);
      return { id: item.id, name: product.name, qty: item.qty, price: product.price };
    }),
    subtotal,
    discount,
    total,
    cashReceived,
    change: cashReceived - total,
    payment: "Cash"
  };
  const name = els.productName.value.trim();
  const category = els.productCategory.value;
  const image = await readImage(els.productImage);
  state.products.push({
    id: uid("PRD"),
    name,
    category,
    price: Number(els.productPrice.value || 0),
    cost: Number(els.productCost.value || 0),
    stock: Number(els.productStock.value || 0),
    sku: els.productSku.value.trim(),
    image: image || fallbackImage(name, category),
    details: els.productDetails.value.trim(),
    created: today
  });
  els.productForm.reset();
  saveState();
  renderAll();
}

  invoice.items.forEach((item) => {
    const product = store.products.find((candidate) => candidate.id === item.id);
    product.stock -= item.qty;
function saveRepair(event) {
  event.preventDefault();
  state.repairs.push({
    id: uid("REP"),
    client: els.repairClient.value.trim(),
    instrument: els.repairInstrument.value.trim(),
    technician: els.repairTech.value.trim(),
    problem: els.repairProblem.value.trim(),
    estimate: Number(els.repairEstimate.value || 0),
    status: els.repairStatus.value,
    date: today
  });
  store.invoices.push(invoice);
  store.cart = [];
  save();
  buildInvoice(invoice);
  els.invoiceDialog.showModal();
  els.checkoutForm.reset();
  els.discountInput.value = 0;
  els.cashReceived.value = 0;
  els.repairForm.reset();
  saveState();
  renderAll();
}

function createBuyback(event) {
function savePurchase(event) {
  event.preventDefault();
  const name = document.querySelector("#usedName").value.trim();
  const category = document.querySelector("#usedCategory").value;
  const condition = document.querySelector("#usedCondition").value;
  const buyPrice = Number(document.querySelector("#buyPrice").value);
  const resalePrice = Number(document.querySelector("#resalePrice").value);
  const entry = {
    id: `USED-${Date.now().toString().slice(-7)}`,
    seller: document.querySelector("#sellerName").value.trim(),
    instrument: name,
    category,
    condition,
    buyPrice,
    resalePrice,
    notes: document.querySelector("#usedNotes").value.trim(),
    date: new Date().toLocaleString()
  };
  store.buybacks.push(entry);
  store.products.push({
    id: entry.id,
    name: `${name} (Used)`,
    category,
    condition: `Used - ${condition}`,
    price: resalePrice,
    stock: 1,
    image: art(category.includes("Guitar") ? "guitar" : category.includes("Drum") ? "drums" : category.includes("Audio") ? "audio" : category.includes("Brass") ? "brass" : "piano", "#3b4657", "#9e1024"),
    details: entry.notes || `Used Yamaha instrument bought for ${money.format(buyPrice)} cash.`
  const productId = els.purchaseProduct.value;
  const qty = Number(els.purchaseQty.value || 0);
  const cost = Number(els.purchaseCost.value || 0);
  const productItem = state.products.find((item) => item.id === productId);
  productItem.stock += qty;
  productItem.cost = cost;
  state.purchases.push({
    id: uid("PUR"),
    supplier: els.supplierName.value.trim(),
    productId,
    qty,
    cost,
    total: qty * cost,
    date: today
  });
  save();
  els.buybackForm.reset();
  els.purchaseForm.reset();
  els.purchaseQty.value = 1;
  saveState();
  renderAll();
}

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
function saveCustomer(event) {
  event.preventDefault();
  state.customers.push({
    id: uid("CUS"),
    name: els.customerName.value.trim(),
    phone: els.customerPhone.value.trim(),
    segment: els.customerSegment.value,
    notes: els.customerNotes.value.trim()
  });
  els.customerForm.reset();
  saveState();
  renderAll();
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderRecords();
  updateStats();
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `makewaves-erp-${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.view) switchView(button.dataset.view);
  if (button.dataset.viewJump) switchView(button.dataset.viewJump);
  if (button.dataset.add) addToCart(button.dataset.add);
  if (button.dataset.inc) changeQuantity(button.dataset.inc, 1);
  if (button.dataset.dec) changeQuantity(button.dataset.dec, -1);
  if (button.dataset.remove) {
    store.cart = store.cart.filter((item) => item.id !== button.dataset.remove);
    save();
function registerEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.view) switchView(button.dataset.view);
    if (button.dataset.jump) switchView(button.dataset.jump);
    if (button.dataset.addCart) addToCart(button.dataset.addCart);
    if (button.dataset.cartRemove) {
      state.cart = state.cart.filter((line) => line.productId !== button.dataset.cartRemove);
      saveState();
      renderCart();
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-cart-price]")) {
      const line = state.cart.find((item) => item.productId === target.dataset.cartPrice);
      line.price = Number(target.value || 0);
      saveState();
      updateSaleTotal();
    }
    if (target.matches("[data-cart-qty]")) {
      const line = state.cart.find((item) => item.productId === target.dataset.cartQty);
      const productItem = state.products.find((item) => item.id === line.productId);
      line.qty = Math.min(productItem.stock, Math.max(1, Number(target.value || 1)));
      saveState();
      updateSaleTotal();
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-repair-status]")) {
      const ticket = state.repairs.find((item) => item.id === target.dataset.repairStatus);
      ticket.status = target.value;
      saveState();
      renderAll();
    }
    if (target.matches("[data-cart-price], [data-cart-qty]")) {
      renderCart();
    }
  });

  els.currencySelect.addEventListener("change", () => {
    state.currency = els.currencySelect.value;
    saveState();
    renderAll();
  });
  els.saleSearch.addEventListener("input", renderSaleProducts);
  els.saleCategory.addEventListener("change", renderSaleProducts);
  els.saleDiscount.addEventListener("input", updateSaleTotal);
  els.productSearch.addEventListener("input", renderInventory);
  els.saleForm.addEventListener("submit", saveSale);
  els.productForm.addEventListener("submit", saveProduct);
  els.repairForm.addEventListener("submit", saveRepair);
  els.purchaseForm.addEventListener("submit", savePurchase);
  els.customerForm.addEventListener("submit", saveCustomer);

  byId("clearCartBtn").addEventListener("click", () => {
    state.cart = [];
    saveState();
    renderCart();
  }
  if (button.dataset.invoice) {
    const invoice = store.invoices.find((item) => item.id === button.dataset.invoice);
    buildInvoice(invoice);
    els.invoiceDialog.showModal();
  }
});
  });
  byId("closeInvoiceBtn").addEventListener("click", () => els.invoiceDialog.close());
  byId("printInvoiceBtn").addEventListener("click", () => window.print());
  byId("exportBtn").addEventListener("click", exportData);
  byId("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset MAKEWAVES demo data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

els.searchInput.addEventListener("input", renderProducts);
els.categoryFilter.addEventListener("change", renderProducts);
els.sortSelect.addEventListener("change", renderProducts);
els.discountInput.addEventListener("input", updateMoney);
els.cashReceived.addEventListener("input", updateMoney);
els.checkoutForm.addEventListener("submit", createInvoice);
els.buybackForm.addEventListener("submit", createBuyback);
document.querySelector("#clearCart").addEventListener("click", () => {
  store.cart = [];
  save();
  renderCart();
});
document.querySelector("#closeInvoice").addEventListener("click", () => els.invoiceDialog.close());
document.querySelector("#printInvoice").addEventListener("click", () => window.print());
document.querySelector("#resetDemo").addEventListener("click", () => {
  if (!confirm("Reset all demo products, carts, invoices, and used purchases?")) return;
  localStorage.removeItem("yamaha-products");
  localStorage.removeItem("yamaha-cart");
  localStorage.removeItem("yamaha-invoices");
  localStorage.removeItem("yamaha-buybacks");
  location.reload();
});
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    els.installBtn.hidden = false;
  });
  els.installBtn.addEventListener("click", async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    installPrompt = null;
    els.installBtn.hidden = true;
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

cacheElements();
registerEvents();
renderAll();