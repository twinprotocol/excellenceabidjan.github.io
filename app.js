let lang = "en";

const translations = {
  en: {
    title: "🎹 Yamaha Shop",
    search: "Search...",
    sell: "Sell Product",
    add: "Add",
    cart: "Cart",
    checkout: "Checkout",
    close: "Close",
    product: "Product",
    price: "Price",
    print: "Print",
    all: "All",
    keyboards: "Keyboards",
    guitars: "Guitars",
    drums: "Drums"
  },
  fr: {
    title: "🎹 Boutique Yamaha",
    search: "Rechercher...",
    sell: "Vendre un produit",
    add: "Ajouter",
    cart: "Panier",
    checkout: "Paiement",
    close: "Fermer",
    product: "Produit",
    price: "Prix",
    print: "Imprimer",
    all: "Tous",
    keyboards: "Claviers",
    guitars: "Guitares",
    drums: "Batteries"
  },
  ar: {
    title: "🎹 متجر ياماها",
    search: "بحث...",
    sell: "بيع منتج",
    add: "إضافة",
    cart: "السلة",
    checkout: "الدفع",
    close: "إغلاق",
    product: "منتج",
    price: "السعر",
    print: "طباعة",
    all: "الكل",
    keyboards: "بيانو",
    guitars: "قيتار",
    drums: "طبول"
  }
};

document.getElementById("langSelect").addEventListener("change", changeLang);

function changeLang() {
  lang = document.getElementById("langSelect").value;
  const t = translations[lang];

  document.getElementById("title").innerText = t.title;
  document.getElementById("search").placeholder = t.search;
  document.getElementById("sellTitle").innerText = t.sell;
  document.getElementById("addBtn").innerText = t.add;
  document.getElementById("cartTitle").innerText = t.cart;
  document.getElementById("checkoutBtn").innerText = t.checkout;
  document.getElementById("closeBtn").innerText = t.close;
  document.getElementById("prodCol").innerText = t.product;
  document.getElementById("priceCol").innerText = t.price;
  document.getElementById("printBtn").innerText = t.print;
  document.getElementById("allBtn").innerText = t.all;
  document.getElementById("keyBtn").innerText = t.keyboards;
  document.getElementById("guitarBtn").innerText = t.guitars;
  document.getElementById("drumBtn").innerText = t.drums;

  document.body.style.direction = (lang === "ar") ? "rtl" : "ltr";
}

let products = JSON.parse(localStorage.getItem("products")) || [
  { name:"Yamaha PSR-E373", price:250000, image:"https://via.placeholder.com/200", category:"keyboard" },
  { name:"Yamaha Guitar F310", price:150000, image:"https://via.placeholder.com/200", category:"guitar" }
];

let cart = [];

function formatPrice(price) {
  return price.toLocaleString() + " FCFA";
}

function displayProducts(list = products) {
  const c = document.getElementById("products");
  c.innerHTML = "";

  list.forEach((p, i) => {
    c.innerHTML += `
      <div class="card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${formatPrice(p.price)}</p>
        <button onclick="addToCart(${i})">+</button>
      </div>
    `;
  });
}

function addProduct() {
  const p = {
    name: name.value,
    price: Number(price.value),
    image: image.value,
    category: category.value
  };

  products.push(p);
  localStorage.setItem("products", JSON.stringify(products));
  displayProducts();
}

function addToCart(i) {
  cart.push(products[i]);
}

function showCart() {
  const list = document.getElementById("cartItems");
  list.innerHTML = "";

  cart.forEach(i => {
    list.innerHTML += `<li>${i.name} - ${formatPrice(i.price)}</li>`;
  });

  cartModal.classList.remove("hidden");
}

function closeCart() {
  cartModal.classList.add("hidden");
}

function checkout() {
  if (!cart.length) return;
  generateInvoice();
  cart = [];
  closeCart();
}

function generateInvoice() {
  let total = 0;
  const items = document.getElementById("invoiceItems");
  items.innerHTML = "";

  cart.forEach(i => {
    total += i.price;
    items.innerHTML += `<tr><td>${i.name}</td><td>${formatPrice(i.price)}</td></tr>`;
  });

  totalPrice.innerText = "Total: " + formatPrice(total);
  invoiceDate.innerText = "Date: " + new Date().toLocaleDateString();
  invoiceNumber.innerText = "INV-" + Date.now();

  invoice.classList.remove("hidden");
}

function printInvoice() {
  window.print();
}

function filterCategory(cat) {
  if (cat === "all") return displayProducts();
  displayProducts(products.filter(p => p.category === cat));
}

search.addEventListener("input", e => {
  const v = e.target.value.toLowerCase();
  displayProducts(products.filter(p => p.name.toLowerCase().includes(v)));
});

displayProducts();