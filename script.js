/* =========================================================
   CONFIG: change these values for your business
   ========================================================= */
const CONFIG = {
  brand: "Nutri Nest",          // your business name
  whatsapp: "919999999999",     // country code + number, no + or spaces
  phone: "+919999999999",
  email: "hello@example.com",
  currency: "₹",                // use "৳" for Bangladesh
};

/* Price is per 250g. Edit/add products freely. */
const PRODUCTS = [
  { id: 1,  name: "California Almonds",  cat: "Nuts",   emoji: "🌰", price: 220, desc: "Crunchy, sweet and rich in protein." },
  { id: 2,  name: "Whole Cashews",       cat: "Nuts",   emoji: "🥜", price: 260, desc: "Creamy W320 grade cashews." },
  { id: 3,  name: "Pistachios",          cat: "Nuts",   emoji: "🥜", price: 320, desc: "Lightly roasted and salted." },
  { id: 4,  name: "Walnut Kernels",      cat: "Nuts",   emoji: "🌰", price: 280, desc: "Brain-friendly omega-3 powerhouse." },
  { id: 5,  name: "Medjool Dates",       cat: "Dates",  emoji: "🌴", price: 240, desc: "Soft, caramel-like and naturally sweet." },
  { id: 6,  name: "Ajwa Dates",          cat: "Dates",  emoji: "🌴", price: 450, desc: "Premium dates from Madinah." },
  { id: 7,  name: "Black Raisins",       cat: "Dried Fruits", emoji: "🍇", price: 120, desc: "Seedless, juicy and tangy-sweet." },
  { id: 8,  name: "Golden Raisins",      cat: "Dried Fruits", emoji: "🍇", price: 130, desc: "Plump golden kishmish." },
  { id: 9,  name: "Dried Figs (Anjeer)", cat: "Dried Fruits", emoji: "🍑", price: 300, desc: "Rich in fibre and minerals." },
  { id: 10, name: "Dried Apricots",      cat: "Dried Fruits", emoji: "🍑", price: 200, desc: "Naturally sweet and chewy." },
  { id: 11, name: "Premium Mixed Nuts",  cat: "Mixes",  emoji: "🥜", price: 250, desc: "Almonds, cashews, raisins and more." },
  { id: 12, name: "Festive Gift Box",    cat: "Mixes",  emoji: "🎁", price: 899, desc: "Beautiful gift box for any occasion." },
];

/* Weight options: label and multiplier of the 250g price */
const WEIGHTS = [
  { label: "250g", mult: 1 },
  { label: "500g", mult: 2 },
  { label: "1kg",  mult: 4 * 0.95 }, // 5% off on 1kg
];

/* =========================================================
   STATE + HELPERS
   ========================================================= */
let cart = [];
let activeCat = "All";

const $ = (s) => document.querySelector(s);
const money = (n) => CONFIG.currency + Math.round(n).toLocaleString();

function loadCart() {
  try { cart = JSON.parse(localStorage.getItem("cart") || "[]"); } catch { cart = []; }
}
function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
}

/* =========================================================
   RENDER
   ========================================================= */
function renderFilters() {
  const cats = ["All", ...new Set(PRODUCTS.map((p) => p.cat))];
  $("#filters").innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  const list = activeCat === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
  $("#productGrid").innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="emoji">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="price">${money(p.price)} <small>/ 250g</small></div>
      <select id="w-${p.id}" aria-label="Weight">
        ${WEIGHTS.map((w, i) => `<option value="${i}">${w.label} - ${money(p.price * w.mult)}</option>`).join("")}
      </select>
      <button class="btn btn-primary" data-add="${p.id}">Add to Cart</button>
    </article>`
    )
    .join("");
}

function renderCart() {
  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = `<p class="empty">Your cart is empty.</p>`;
  } else {
    box.innerHTML = cart
      .map((it, i) => {
        const p = PRODUCTS.find((x) => x.id === it.id);
        const w = WEIGHTS[it.w];
        return `
        <div class="item">
          <div class="em">${p.emoji}</div>
          <div class="info">
            <strong>${p.name}</strong>
            <small>${w.label} · ${money(p.price * w.mult)}</small>
          </div>
          <div class="qty">
            <button data-dec="${i}">−</button>
            <span>${it.qty}</span>
            <button data-inc="${i}">+</button>
          </div>
        </div>`;
      })
      .join("");
  }
  $("#cartTotal").textContent = money(cartTotal());
  $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function cartTotal() {
  return cart.reduce((sum, it) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    return sum + p.price * WEIGHTS[it.w].mult * it.qty;
  }, 0);
}

/* =========================================================
   ACTIONS
   ========================================================= */
function addToCart(id) {
  const w = Number($(`#w-${id}`).value);
  const found = cart.find((i) => i.id === id && i.w === w);
  if (found) found.qty++;
  else cart.push({ id, w, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  renderCart();
}

function openCart() { $("#drawer").classList.add("open"); $("#overlay").classList.add("show"); }
function closeCart() { $("#drawer").classList.remove("open"); $("#overlay").classList.remove("show"); }

function checkout() {
  if (!cart.length) return alert("Your cart is empty.");
  const name = $("#custName").value.trim();
  const address = $("#custAddress").value.trim();
  if (!name || !address) return alert("Please enter your name and delivery address.");

  const lines = cart.map((it, i) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    const w = WEIGHTS[it.w];
    return `${i + 1}. ${p.name} (${w.label}) x${it.qty} = ${money(p.price * w.mult * it.qty)}`;
  });
  const msg =
    `Hello ${CONFIG.brand}, I want to order:\n\n${lines.join("\n")}\n\n` +
    `Total: ${money(cartTotal())}\nName: ${name}\nAddress: ${address}`;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  document.title = `${CONFIG.brand} | Premium Dry Fruits`;
  document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = CONFIG.brand));
  $("#year").textContent = new Date().getFullYear();
  $("#waLink").href = `https://wa.me/${CONFIG.whatsapp}`;
  $("#callLink").href = `tel:${CONFIG.phone}`;
  $("#mailLink").href = `mailto:${CONFIG.email}`;

  loadCart();
  renderFilters();
  renderProducts();
  renderCart();

  $("#filters").addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (!c) return;
    activeCat = c.dataset.cat;
    renderFilters();
    renderProducts();
  });
  $("#productGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (b) addToCart(Number(b.dataset.add));
  });
  $("#cartItems").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) changeQty(Number(inc.dataset.inc), 1);
    if (dec) changeQty(Number(dec.dataset.dec), -1);
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#checkout").addEventListener("click", checkout);
  $("#burger").addEventListener("click", () => $("#menu").classList.toggle("show"));
  $("#menu").addEventListener("click", () => $("#menu").classList.remove("show"));
});
