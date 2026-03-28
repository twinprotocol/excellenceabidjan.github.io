let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

function saveData(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function format(p){
  return p.toLocaleString() + " FCFA";
}

function displayProducts(){
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach((p,i)=>{
    container.innerHTML += `
    <div class="card">
      <img src="${p.image || 'https://via.placeholder.com/200'}">
      <h3>${p.name}</h3>
      <p>Sell: ${format(p.sellPrice)}</p>
      <p>Buy: ${format(p.buyPrice)}</p>
      <p>Stock: ${p.stock}</p>
      <button onclick="addToCart(${i})" ${p.stock<=0?'disabled':''}>Add</button>
    </div>`;
  });
}

function addProduct(){
  products.push({
    name:name.value,
    buyPrice:+buyPrice.value,
    sellPrice:+sellPrice.value,
    stock:+stock.value,
    image:image.value
  });
  saveData();
  displayProducts();
}

function restockProduct(){
  const pname = name.value;
  const qty = Number(stock.value);
  let p = products.find(x => x.name === pname);
  if(p){
    p.stock += qty;
    saveData();
    displayProducts();
  }
}

function addToCart(i){
  if(products[i].stock <= 0) return;
  cart.push(products[i]);
  products[i].stock--;
  saveData();
  displayProducts();
  updateCartCount();
}

function updateCartCount(){
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

  const invoice = {
    id: "INV-" + Date.now(),
    date: new Date().toLocaleDateString(),
    items: [...cart],
    revenue,
    cost,
    profit
  };

  invoices.push(invoice);
  saveData();

  generateInvoice(invoice);
  cart = [];
  updateCartCount();
  closeCart();
  updateDashboard();
}

function generateInvoice(inv){
  invoiceItems.innerHTML = "";

  inv.items.forEach(i=>{
    invoiceItems.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${format(i.sellPrice)}</td>
      </tr>`;
  });

  totalPrice.innerText = "Total: " + format(inv.revenue);
  invoiceInfo.innerText = inv.id + " | " + inv.date;
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
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.filter(p => p.name.toLowerCase().includes(v))
  .forEach((p,i)=>{
    container.innerHTML += `
    <div class="card">
      <h3>${p.name}</h3>
      <p>${format(p.sellPrice)}</p>
    </div>`;
  });
});

updateDashboard();
displayProducts();