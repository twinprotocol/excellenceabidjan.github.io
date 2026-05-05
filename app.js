let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];

function save(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoices", JSON.stringify(invoices));
}

function format(n){
  return n.toLocaleString() + " FCFA";
}

function renderProducts(list = products){
  productsDiv.innerHTML = "";

  list.forEach((p,i)=>{
    productsDiv.innerHTML += `
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
    name:name.value,
    buy:+buy.value,
    sell:+sell.value,
    stock:+stock.value,
    image:image.value
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

function checkout(){
  if(!cart.length) return;

  let revenue = 0;
  let cost = 0;

  cart.forEach(i=>{
    revenue += i.sell;
    cost += i.buy;
  });

  let profit = revenue - cost;

  let inv = {
    id:"INV-"+Date.now(),
    date:new Date().toLocaleString(),
    items:[...cart],
    revenue,
    profit
  };

  invoices.push(inv);
  save();

  showInvoice(inv);
  updateHistory();

  cart=[];
  cartCount.innerText=0;
}

function showInvoice(inv){
  invoiceTable.innerHTML="";

  inv.items.forEach(i=>{
    invoiceTable.innerHTML += `<tr><td>${i.name}</td><td>${format(i.sell)}</td></tr>`;
  });

  invoiceInfo.innerText = inv.id + " | " + inv.date;
  invoiceTotal.innerText = format(inv.revenue);

  invoiceModal.classList.remove("hidden");
}

function updateDashboard(){
  let today = new Date().toLocaleDateString();

  let todayInv = invoices.filter(i => i.date.includes(today));

  let revenue = todayInv.reduce((a,b)=>a+b.revenue,0);
  let profit = todayInv.reduce((a,b)=>a+b.profit,0);

  sales.innerText = "Sales: " + todayInv.length;
  revenue.innerText = "Revenue: " + format(revenue);
  profit.innerText = "Profit: " + format(profit);
}

function updateHistory(){
  historyList.innerHTML="";

  invoices.slice().reverse().forEach(inv=>{
    historyList.innerHTML += `
      <li>
        ${inv.id} - ${format(inv.revenue)}
        <button onclick='showInvoice(${JSON.stringify(inv)})'>View</button>
      </li>
    `;
  });
}

/* PDF EXPORT */
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Invoice", 10, 10);
  doc.text(invoiceInfo.innerText, 10, 20);
  doc.text(invoiceTotal.innerText, 10, 30);

  doc.save("invoice.pdf");
}

/* SEARCH */
search.addEventListener("input", e=>{
  let v = e.target.value.toLowerCase();

  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(v)
  ));
});

/* CART UI */
cartBtn.onclick = ()=> cartModal.classList.remove("hidden");
closeCart = ()=> cartModal.classList.add("hidden");

/* INIT */
renderProducts();
updateDashboard();
updateHistory();