let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

let currentLang = "en";

const translations = {
  en: { add: "Add Product", search: "Search products..." },
  fr: { add: "Ajouter Produit", search: "Rechercher..." },
  ar: { add: "إضافة منتج", search: "بحث..." }
};

function setLanguage(lang){
  currentLang = lang;

  document.getElementById("search").placeholder = translations[lang].search;
  document.getElementById("panelTitle").innerText = translations[lang].add;

  if(lang === "ar"){
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
}

function save(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function format(n){
  return n.toLocaleString() + " FCFA";
}

function displayProducts(list = products){
  const container = document.getElementById("products");
  container.innerHTML = "";

  list.forEach((p,i)=>{
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h3>${p.name}</h3>
        <p>${format(p.sellPrice)}</p>
        <p>Stock: ${p.stock}</p>
        <button onclick="addToCart(${i})" ${p.stock<=0?'disabled':''}>Add</button>
      </div>
    `;
  });
}

function addProduct(){
  products.push({
    name: name.value,
    buyPrice: Number(buyPrice.value),
    sellPrice: Number(sellPrice.value),
    stock: Number(stock.value),
    image: image.value
  });

  save();
  displayProducts();
}

function restockProduct(){
  let p = products.find(x => x.name === name.value);
  if(p){
    p.stock += Number(stock.value);
    save();
    displayProducts();
  }
}

function addToCart(i){
  if(products[i].stock <= 0) return;

  cart.push(products[i]);
  products[i].stock--;

  save();
  displayProducts();
  cartCount.innerText = cart.length;
}

function showCart(){
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(i=>{
    total += i.sellPrice;
    cartItems.innerHTML += `<li>${i.name} - ${format(i.sellPrice)}</li>`;
  });

  cartTotal.innerText = "Total: " + format(total);
  cartModal.classList.remove("hidden");
}

function closeCart(){
  cartModal.classList.add("hidden");
}

function checkout(){
  if(!cart.length) return;

  let revenue = 0;
  let cost = 0;

  cart.forEach(i=>{
    revenue += i.sellPrice;
    cost += i.buyPrice;
  });

  let profit = revenue - cost;

  let invoice = {
    id: "INV-" + Date.now(),
    date: new Date().toLocaleDateString(),
    items: [...cart],
    revenue,
    cost,
    profit
  };

  invoices.push(invoice);
  save();

  cart = [];
  cartCount.innerText = 0;

  generateInvoice(invoice);
  updateDashboard();
  closeCart();
}

function generateInvoice(inv){
  invoiceItems.innerHTML = "";

  inv.items.forEach(i=>{
    invoiceItems.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${format(i.sellPrice)}</td>
      </tr>
    `;
  });

  invoiceInfo.innerText = inv.id + " | " + inv.date;
  totalPrice.innerText = "Total: " + format(inv.revenue);
  invoice.classList.remove("hidden");
}

function updateDashboard(){
  let today = new Date().toLocaleDateString();

  let todayInvoices = invoices.filter(i => i.date === today);

  let revenue = todayInvoices.reduce((t,i)=>t+i.revenue,0);
  let profit = todayInvoices.reduce((t,i)=>t+i.profit,0);

  salesToday.innerText = "Sales: " + todayInvoices.length;
  revenueToday.innerText = "Revenue: " + format(revenue);
  profitToday.innerText = "Profit: " + format(profit);
}

search.addEventListener("input", e=>{
  let v = e.target.value.toLowerCase();

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(v)
  );

  displayProducts(filtered);
});

setLanguage("en");
displayProducts();
updateDashboard();