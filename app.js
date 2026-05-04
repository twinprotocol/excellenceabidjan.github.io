let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

const langSelect = document.getElementById("language");

const translations = {
  en: { add: "Add Product", search: "Search products..." },
  fr: { add: "Ajouter Produit", search: "Rechercher..." },
  ar: { add: "إضافة منتج", search: "بحث..." }
};

function save(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function format(n){
  return n.toLocaleString() + " FCFA";
}

function renderProducts(list = products){
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  list.forEach((p,i)=>{
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h4>${p.name}</h4>
        <p>${format(p.sell)}</p>
        <p>Stock: ${p.stock}</p>
        <button onclick="addToCart(${i})">Add</button>
      </div>
    `;
  });
}

function addProduct(){
  const p = {
    name: pName.value,
    buy: Number(pBuy.value),
    sell: Number(pSell.value),
    stock: Number(pStock.value),
    image: pImage.value
  };

  if(!p.name) return;

  products.push(p);
  save();
  renderProducts();
}

function addToCart(i){
  if(products[i].stock <= 0) return;

  cart.push(products[i]);
  products[i].stock--;

  save();
  renderProducts();
  cartCount.innerText = cart.length;
}

function openCart(){
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(i=>{
    total += i.sell;
    cartList.innerHTML += `<li>${i.name} - ${format(i.sell)}</li>`;
  });

  cartTotal.innerText = format(total);
  cartModal.classList.remove("hidden");
}

function closeCart(){
  cartModal.classList.add("hidden");
}

function checkout(){
  if(cart.length === 0) return;

  let revenue = 0;
  let cost = 0;

  cart.forEach(i=>{
    revenue += i.sell;
    cost += i.buy;
  });

  let profit = revenue - cost;

  let invoice = {
    id: "INV-" + Date.now(),
    date: new Date().toLocaleDateString(),
    items: [...cart],
    revenue,
    profit
  };

  invoices.push(invoice);
  save();

  showInvoice(invoice);

  cart = [];
  cartCount.innerText = 0;

  closeCart();
  updateDashboard();
}

function showInvoice(inv){
  invoiceTable.innerHTML = "";

  inv.items.forEach(i=>{
    invoiceTable.innerHTML += `<tr><td>${i.name}</td><td>${format(i.sell)}</td></tr>`;
  });

  invoiceHeader.innerText = inv.id + " - " + inv.date;
  invoiceTotal.innerText = format(inv.revenue);

  invoiceModal.classList.remove("hidden");
}

function updateDashboard(){
  let today = new Date().toLocaleDateString();
  let todayInv = invoices.filter(i => i.date === today);

  let revenue = todayInv.reduce((a,b)=>a+b.revenue,0);
  let profit = todayInv.reduce((a,b)=>a+b.profit,0);

  sales.innerText = "Sales: " + todayInv.length;
  revenue.innerText = "Revenue: " + format(revenue);
  profit.innerText = "Profit: " + format(profit);
}

function setLanguage(){
  const lang = langSelect.value;

  document.getElementById("panelTitle").innerText = translations[lang].add;
  document.getElementById("search").placeholder = translations[lang].search;

  document.body.classList.toggle("rtl", lang === "ar");
}

document.getElementById("search").addEventListener("input", e=>{
  const v = e.target.value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(v)));
});

document.getElementById("cartBtn").onclick = openCart;
document.getElementById("closeCartBtn").onclick = closeCart;
document.getElementById("checkoutBtn").onclick = checkout;
document.getElementById("addBtn").onclick = addProduct;
langSelect.onchange = setLanguage;

setLanguage();
renderProducts();
updateDashboard();