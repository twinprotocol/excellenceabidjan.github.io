const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const todayKey = new Date().toISOString().slice(0, 10);

const art = (kind, primary, secondary) => {
  const icons = {
    piano: '<rect x="35" y="122" width="250" height="48" rx="10" fill="#151922"/><rect x="55" y="132" width="210" height="26" rx="4" fill="#fff"/><g fill="#151922"><rect x="72" y="132" width="8" height="17"/><rect x="102" y="132" width="8" height="17"/><rect x="132" y="132" width="8" height="17"/><rect x="177" y="132" width="8" height="17"/><rect x="207" y="132" width="8" height="17"/></g><path d="M90 120c12-52 74-73 124-47 30 16 54 35 81 18-8 34-36 53-77 50l-128-21Z" fill="#262b36"/>',
    guitar: '<path d="M142 54h78l-44 92c13 19 9 47-11 63-24 19-61 13-78-14-13-22-9-51 11-68l44-73Z" fill="#f4c36a"/><path d="M209 45l52-30 12 21-51 31Z" fill="#2c3340"/><circle cx="137" cy="164" r="25" fill="#1b202b"/><path d="M129 71l79 137" stroke="#1b202b" stroke-width="5"/>',
    drums: '<ellipse cx="116" cy="96" rx="58" ry="20" fill="#ffffff"/><rect x="58" y="96" width="116" height="72" fill="#c71931"/><ellipse cx="116" cy="168" rx="58" ry="20" fill="#831424"/><circle cx="220" cy="124" r="34" fill="#222a36"/><ellipse cx="220" cy="124" rx="34" ry="12" fill="#fff"/><path d="M53 65h90M232 64h58" stroke="#222a36" stroke-width="8" stroke-linecap="round"/>',
    brass: '<path d="M64 150c55 6 98-14 128-55l37-50 23 13-34 59c-35 60-94 78-157 60Z" fill="#d59c32"/><circle cx="252" cy="58" r="34" fill="#efc05b"/><circle cx="252" cy="58" r="17" fill="#f8df9d"/><path d="M118 112c15-18 36-21 53-11" stroke="#875f16" stroke-width="10" fill="none"/>',
    audio: '<rect x="70" y="45" width="180" height="165" rx="14" fill="#202733"/><circle cx="160" cy="106" r="42" fill="#3b4657"/><circle cx="160" cy="106" r="20" fill="#121721"/><circle cx="160" cy="172" r="22" fill="#c71931"/><rect x="105" y="62" width="110" height="10" rx="5" fill="#eef2f8"/>',
    accessory: '<rect x="66" y="64" width="188" height="128" rx="18" fill="#2e3542"/><path d="M96 97h128M96 128h128M96 159h84" stroke="#fff" stroke-width="14" stroke-linecap="round"/><circle cx="221" cy="158" r="18" fill="#c71931"/>'
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs><rect width="320" height="240" fill="url(#bg)"/><circle cx="45" cy="45" r="24" fill="#fff" opacity=".24"/><circle cx="278" cy="198" r="54" fill="#fff" opacity=".14"/>${icons[kind]}<text x="24" y="218" font-family="Arial" font-size="22" font-weight="800" fill="#fff">YAMAHA</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

const store = {
  products: load("yamaha-products", seedProducts),
  cart: load("yamaha-cart", []),
  invoices: load("yamaha-invoices", []),
  buybacks: load("yamaha-buybacks", [])
};

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

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save() {
  localStorage.setItem("yamaha-products", JSON.stringify(store.products));
  localStorage.setItem("yamaha-cart", JSON.stringify(store.cart));
  localStorage.setItem("yamaha-invoices", JSON.stringify(store.invoices));
  localStorage.setItem("yamaha-buybacks", JSON.stringify(store.buybacks));
}

function emptyNode() {
  return document.querySelector("#emptyTemplate").content.cloneNode(true);
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
}

function renderProducts() {
  const term = els.searchInput.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  let products = store.products.filter((product) => {
    const matchesTerm = [product.name, product.category, product.condition, product.details].join(" ").toLowerCase().includes(term);
    const matchesCategory = category === "All" || product.category === category;
    return matchesTerm && matchesCategory;
  });

  products = products.sort((a, b) => {
    if (els.sortSelect.value === "priceLow") return a.price - b.price;
    if (els.sortSelect.value === "priceHigh") return b.price - a.price;
    if (els.sortSelect.value === "stock") return b.stock - a.stock;
    return a.id.localeCompare(b.id);
  });

  els.productGrid.innerHTML = "";
  if (!products.length) {
    els.productGrid.append(emptyNode());
    return;
  }

  products.forEach((product) => {
    const stockClass = product.stock === 0 ? "stock-out" : product.stock <= 3 ? "stock-low" : "";
    const card = document.createElement("article");
    card.className = "product-card";
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
      </div>
    `;
    els.productGrid.append(card);
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
  }
  updateMoney();
}

function updateMoney() {
  const subtotal = cartSubtotal();
  const discount = Number(els.discountInput.value || 0);
  const total = Math.max(0, subtotal - discount);
  const cash = Number(els.cashReceived.value || 0);
  els.subtotalValue.textContent = money.format(subtotal);
  els.changeValue.textContent = money.format(Math.max(0, cash - total));
  els.statCart.textContent = money.format(total);
}

function renderRecords() {
  els.buybackList.innerHTML = "";
  els.invoiceList.innerHTML = "";
  els.stockList.innerHTML = "";

  if (!store.buybacks.length) {
    els.buybackList.append(emptyNode());
  } else {
    store.buybacks.slice().reverse().forEach((entry) => {
      const row = document.createElement("div");
      row.className = "record-item";
      row.innerHTML = `<div><strong>${entry.instrument}</strong><div class="record-meta">${entry.seller} &middot; ${entry.condition} &middot; ${entry.date}</div></div><b>${money.format(entry.buyPrice)}</b>`;
      els.buybackList.append(row);
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
}

function updateStats() {
  const todaySales = store.invoices.filter((invoice) => invoice.date.startsWith(todayKey)).reduce((sum, invoice) => sum + invoice.total, 0);
  els.statSales.textContent = money.format(todaySales);
  els.statStock.textContent = store.products.reduce((sum, product) => sum + product.stock, 0);
  els.statBuybacks.textContent = store.buybacks.length;
}

function addToCart(id) {
  const product = store.products.find((candidate) => candidate.id === id);
  if (!product || product.stock <= 0) return;
  const item = store.cart.find((candidate) => candidate.id === id);
  if (item) {
    if (item.qty < product.stock) item.qty += 1;
  } else {
    store.cart.push({ id, qty: 1 });
  }
  save();
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
  }
  if (item.qty > product.stock) item.qty = product.stock;
  save();
  renderCart();
}

function buildInvoice(invoice) {
  const rows = invoice.items.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${money.format(item.price)}</td>
      <td>${money.format(item.price * item.qty)}</td>
    </tr>
  `).join("");

  els.invoiceSheet.innerHTML = `
    <div class="invoice-header">
      <div>
        <h2>Yamaha Musical Instrument Shop</h2>
        <p>Cash sales and instrument buyback desk</p>
        <p>Payment: <strong>Cash only</strong></p>
      </div>
      <div>
        <strong>Invoice ${invoice.id}</strong>
        <p>${invoice.date}</p>
      </div>
    </div>
    <p><strong>Client:</strong> ${invoice.client.name}<br><strong>Phone:</strong> ${invoice.client.phone || "Not provided"}<br><strong>Address:</strong> ${invoice.client.address || "Not provided"}</p>
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
  `;
}

function createInvoice(event) {
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

  invoice.items.forEach((item) => {
    const product = store.products.find((candidate) => candidate.id === item.id);
    product.stock -= item.qty;
  });
  store.invoices.push(invoice);
  store.cart = [];
  save();
  buildInvoice(invoice);
  els.invoiceDialog.showModal();
  els.checkoutForm.reset();
  els.discountInput.value = 0;
  els.cashReceived.value = 0;
  renderAll();
}

function createBuyback(event) {
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
  });
  save();
  els.buybackForm.reset();
  renderAll();
}

function switchView(view) {
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.remove("active"));
  document.querySelector(`#${view}View`).classList.add("active");
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderRecords();
  updateStats();
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
    renderCart();
  }
  if (button.dataset.invoice) {
    const invoice = store.invoices.find((item) => item.id === button.dataset.invoice);
    buildInvoice(invoice);
    els.invoiceDialog.showModal();
  }
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

renderAll();