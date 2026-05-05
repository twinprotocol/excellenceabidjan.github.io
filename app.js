// ====== STATE ======
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
let currentCat = "all";

// ====== DOM ======
const el = id => document.getElementById(id);

const nameInput = el("name");
const buyInput = el("buy");
const sellInput = el("sell");
const stockInput = el("stock");
const imageInput = el("image");
const categoryInput = el("category");

const productsContainer = el("products");
const cartModal = el("cartModal");
const cartItems = el("cartItems");
const totalEl = el("total");
const changeEl = el("change");
const cashInput = el("cash");
const cartCount = el("cartCount");

// ====== HELPERS ======
function save(){
  localStorage.setItem("products", JSON.stringify(products));
}

function currency(){
  return el("currency").value;
}

function format(n){
  return (n || 0).toLocaleString() + " " + currency();
}

// ====== RENDER ======
function render(){
  productsContainer.innerHTML = "";

  let list = products.filter(p =>
    currentCat === "all" || p.category === currentCat
  );

  list.forEach((p,index)=>{
    let realIndex = products.indexOf(p);

    productsContainer.innerHTML += `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/200'}">
        <h4>${p.name}</h4>
        <p>${format(p.sell)}</p>
        <p>${p.stock <= 3 ? '⚠ Low stock' : 'Stock: '+p.stock}</p>
        <button onclick="addToCart(${realIndex})" ${p.stock<=0?'disabled':''}>
          Add
        </button>
      </div>
    `;
  });
}

// ====== PRODUCT ======
function addProduct(){
  const p = {
    name: nameInput.value.trim(),
    buy: Number(buyInput.value),
    sell: Number(sellInput.value),
    stock: Number(stockInput.value),
    image: imageInput.value,
    category: categoryInput.value
  };

  if(!p.name || !p.sell || !p.stock){
    alert("Fill all fields");
    return;
  }

  products.push(p);
  save();
  render();

  // reset
  nameInput.value = "";
  buyInput.value = "";
  sellInput.value = "";
  stockInput.value = "";
  imageInput.value = "";
}

// ====== FILTER ======
function filterCat(cat){
  currentCat = cat;
  render();
}

// ====== CART ======
function addToCart(i){
  let p = products[i];
  if(p.stock <= 0) return;

  cart.push({...p});
  p.stock--;

  save();
  render();
  updateCartCount();
  updateCart();
}

function updateCartCount(){
  cartCount.innerText = cart.length;
}

function openCart(){
  cartModal.classList.remove("hidden");
  updateCart();
}

function closeCart(){
  cartModal.classList.add("hidden");
}

function updateCart(){
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item,i)=>{
    total += item.sell;

    cartItems.innerHTML += `
      <li>
        ${item.name}
        <input type="number" value="${item.sell}" 
          onchange="editPrice(${i}, this.value)">
      </li>
    `;
  });

  totalEl.innerText = format(total);

  let cash = Number(cashInput.value || 0);
  changeEl.innerText = format(cash - total);
}

function editPrice(i,val){
  cart[i].sell = Number(val);
  updateCart();
}

// ====== CASH ======
cashInput.addEventListener("input", updateCart);

// ====== CHECKOUT ======
function checkout(){
  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  let total = 0;
  el("invTable").innerHTML = "";

  cart.forEach(i=>{
    total += i.sell;
    el("invTable").innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${format(i.sell)}</td>
      </tr>
    `;
  });

  el("invTotal").innerText = format(total);
  el("invInfo").innerText = new Date().toLocaleString();

  el("invoiceModal").classList.remove("hidden");

  cart = [];
  updateCartCount();
  closeCart();
}

// ====== SEARCH ======
el("search").addEventListener("input", e=>{
  let v = e.target.value.toLowerCase();

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(v)
  );

  productsContainer.innerHTML = "";

  filtered.forEach(p=>{
    productsContainer.innerHTML += `
      <div class="card">
        <h4>${p.name}</h4>
        <p>${format(p.sell)}</p>
      </div>
    `;
  });
});

// ====== EVENTS ======
el("cartBtn").onclick = openCart;

// ====== INIT ======
render();
updateCartCount();