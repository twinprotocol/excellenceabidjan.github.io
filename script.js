// ===== Tab Switching =====
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.style.display = "none");
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).style.display = "block";
  });
});

// ===== Products =====
let products = [];
let sales = [];
let clients = [];

const addForm = document.getElementById("add-product-form");
const productTable = document.querySelector("#product-table tbody");

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("product-name").value;
  const category = document.getElementById("product-category").value;
  const price = parseFloat(document.getElementById("product-price").value);
  const cost = parseFloat(document.getElementById("product-cost").value);
  const quantity = parseInt(document.getElementById("product-quantity").value);
  const imageFile = document.getElementById("product-image").files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const product = { name, category, price, cost, quantity, image: reader.result };
    products.push(product);
    renderProducts();
    addForm.reset();
  };
  if(imageFile){
    reader.readAsDataURL(imageFile);
  } else {
    const product = { name, category, price, cost, quantity, image: "" };
    products.push(product);
    renderProducts();
    addForm.reset();
  }
});

function renderProducts(){
  productTable.innerHTML = "";
  products.forEach((p, index)=>{
    productTable.innerHTML += `<tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price}</td>
      <td>${p.cost}</td>
      <td>${p.quantity}</td>
      <td>${p.image ? `<img src="${p.image}" width="50">` : ""}</td>
    </tr>`;
  });
}

// ===== Search Filter =====
document.getElementById("search-product").addEventListener("input", (e)=>{
  const filter = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#product-table tbody tr");
  rows.forEach(row=>{
    row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
  });
});

// ===== Language =====
const langSelect = document.getElementById("language-select");
const translations = {
  fr: { "Produits": "Produits", "Ajouter": "Ajouter", "Ventes":"Ventes", "Clients":"Clients","Exporter":"Exporter" },
  ar: { "Produits":"المنتجات", "Ajouter":"إضافة", "Ventes":"المبيعات", "Clients":"العملاء","Exporter":"تصدير" },
  en: { "Produits":"Products", "Ajouter":"Add", "Ventes":"Sales", "Clients":"Clients","Exporter":"Export" }
};

langSelect.addEventListener("change", ()=>{
  const lang = langSelect.value;
  tabs.forEach(tab=>{
    tab.textContent = translations[lang][tab.dataset.tab];
  });
});

// ===== Sales =====
const salesTable = document.querySelector("#sales-table tbody");
const salesTotalEl = document.getElementById("sales-total");

document.getElementById("filter-sales").addEventListener("click", ()=>{
  const date = document.getElementById("sales-date").value;
  renderSales(date);
});

function renderSales(date){
  salesTable.innerHTML = "";
  let total = 0;
  sales.filter(s=>s.date===date).forEach(s=>{
    const totalPrice = s.price * s.quantity;
    total += totalPrice;
    salesTable.innerHTML += `<tr>
      <td>${s.name}</td>
      <td>${s.price}</td>
      <td>${s.quantity}</td>
      <td>${totalPrice}</td>
      <td>${s.date}</td>
    </tr>`;
  });
  salesTotalEl.textContent = total;
}

// ===== Print Sales =====
document.getElementById("print-sales").addEventListener("click", ()=>{
  const printContent = document.getElementById("ventes").innerHTML;
  const newWin = window.open("");
  newWin.document.write(`<html><head><title>Ventes</title></head><body>${printContent}</body></html>`);
  newWin.print();
});

// ===== Export CSV =====
document.getElementById("export-csv").addEventListener("click", ()=>{
  let csv = "Nom,Catégorie,Prix,Coût,Quantité\n";
  products.forEach(p=>{
    csv += `${p.name},${p.category},${p.price},${p.cost},${p.quantity}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "products.csv";
  link.click();
});

// ===== Import CSV =====
document.getElementById("import-file").addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = reader.result.split("\n").slice(1);
    lines.forEach(line=>{
      if(line.trim()!==""){
        const [name, category, price, cost, quantity] = line.split(",");
        products.push({ name, category, price:parseFloat(price), cost:parseFloat(cost), quantity:parseInt(quantity), image:"" });
      }
    });
    renderProducts();
  };
  reader.readAsText(file);
});
