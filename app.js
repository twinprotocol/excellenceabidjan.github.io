let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

let lang = "en";

const t = {
  en: { add: "Add Product", search: "Search..." },
  fr: { add: "Ajouter Produit", search: "Rechercher..." },
  ar: { add: "إضافة منتج", search: "بحث..." }
};

function setLang(l){
  lang = l;
  document.getElementById("panelTitle").innerText = t[l].add;
  document.getElementById("search").placeholder = t[l].search;

  document.body.classList.toggle("rtl", l === "ar");
}

function save(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function format(n){
  return n.toLocaleString() + " FCFA";
}

function renderProducts(list = products){
  let container = document.getElementById("productList");
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
  products.push({
    name: name.value,
    buy: Number(buy.value),
    sell: Number(sell.value),
    stock: Number(stock.value),
    image: image.value
  });

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
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(i=>{
    total += i.sell;
    cartItems.innerHTML += `<li>${i.name} - ${format(i.sell)}</li>`;
  });

  totalEl.innerText = format(total);
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
  invoiceBody.innerHTML = "";

  inv.items.forEach(i=>{
    invoiceBody.innerHTML += `<tr><td>${i.name}</td><td>${format(i.sell)}</td></tr>`;
  });

  invoiceInfo.innerText = inv.id + " - " + inv.date;
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

search.addEventListener("input", e=>{
  let v = e.target.value.toLowerCase();

  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(v)
  ));
});

setLang("en");
renderProducts();
updateDashboard();