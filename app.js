let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let currentCat = "all";

function save(){
  localStorage.setItem("products", JSON.stringify(products));
}

function currency(){
  return document.getElementById("currency").value;
}

function format(n){
  return n.toLocaleString() + " " + currency();
}

function render(){
  const container = document.getElementById("products");
  container.innerHTML = "";

  let list = products.filter(p => 
    currentCat === "all" || p.category === currentCat
  );

  list.forEach((p,i)=>{
    container.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h4>${p.name}</h4>
        <p>${format(p.sell)}</p>
        <p>Stock: ${p.stock <= 3 ? '⚠ Low' : p.stock}</p>
        <button onclick="addToCart(${i})" ${p.stock<=0?'disabled':''}>Add</button>
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
    image:image.value,
    category:category.value
  });

  save();
  render();
}

function filterCat(cat){
  currentCat = cat;
  render();
}

function addToCart(i){
  let p = products[i];
  if(p.stock<=0) return;

  cart.push({...p});
  p.stock--;

  save();
  render();
  cartCount.innerText = cart.length;
}

cartBtn.onclick = ()=> cartModal.classList.remove("hidden");

function closeCart(){
  cartModal.classList.add("hidden");
}

function updateCart(){
  cartItems.innerHTML="";
  let total = 0;

  cart.forEach((item,i)=>{
    total += item.sell;

    cartItems.innerHTML += `
      <li>
        ${item.name} 
        <input type="number" value="${item.sell}" onchange="editPrice(${i},this.value)">
      </li>
    `;
  });

  totalEl = document.getElementById("total");
  totalEl.innerText = format(total);

  let cash = Number(document.getElementById("cash").value || 0);
  document.getElementById("change").innerText = format(cash - total);
}

function editPrice(i,val){
  cart[i].sell = Number(val);
  updateCart();
}

document.getElementById("cash").addEventListener("input", updateCart);

function checkout(){
  if(!cart.length) return;

  invTable.innerHTML="";
  let total = 0;

  cart.forEach(i=>{
    total += i.sell;
    invTable.innerHTML += `<tr><td>${i.name}</td><td>${format(i.sell)}</td></tr>`;
  });

  invTotal.innerText = format(total);
  invInfo.innerText = "Date: " + new Date().toLocaleString();

  invoiceModal.classList.remove("hidden");

  cart = [];
  cartCount.innerText = 0;
  closeCart();
}

document.getElementById("search").addEventListener("input", e=>{
  let v = e.target.value.toLowerCase();

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(v)
  );

  const container = document.getElementById("products");
  container.innerHTML = "";

  filtered.forEach((p,i)=>{
    container.innerHTML += `<div class="card"><h4>${p.name}</h4></div>`;
  });
});

render();