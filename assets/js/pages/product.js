// assets/js/pages/product.js

import { state, setProducts, getNextBatch, getRandomBatch } from "../core/state.js";

const grid = document.getElementById("product-display-grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

/* ================= LOAD PRODUCTS ================= */
export async function loadProducts() {
  try {
    const res = await fetch("/assets/json/products.json");
    const data = await res.json();

    setProducts(data);

    // fast first 20
    renderProducts(getNextBatch());
    toggleLoadMore(true);

  } catch (err) {
    console.error("Product load failed:", err);
  }
}

/* ================= LOAD MORE ================= */
async function handleLoadMore() {
  if (!loadMoreBtn) return;

  const originalText = loadMoreBtn.innerText;

  // loading state
  loadMoreBtn.innerText = "Loading...";
  loadMoreBtn.disabled = true;

  try {
    let batch = [];

    if (state.mode === "normal") {
      batch = getNextBatch();
    } else {
      batch = getRandomBatch();
    }

    // small delay দিলে UI smooth লাগে (optional)
    await new Promise(r => setTimeout(r, 300));

    renderProducts(batch);

  } finally {
    // restore button
    loadMoreBtn.innerText = originalText;
    loadMoreBtn.disabled = false;
  }
}

loadMoreBtn?.addEventListener("click", handleLoadMore);

/* ================= RENDER ================= */
function renderProducts(products) {
  if (!grid || !products.length) return;

  grid.insertAdjacentHTML(
    "beforeend",
    products.map(productCard).join("")
  );
}

/* ================= UI ================= */
function toggleLoadMore(show) {
  if (!loadMoreBtn) return;
  loadMoreBtn.style.display = show ? "block" : "none";
}

/* ================= CARD ================= */
function productCard(p) {
  return `
    <div class="product-card" onclick="openProductPage(${p.id})">
      <div class="discount-badge">${p.discount}<br>OFF</div>
      <div class="product-image">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="product-info">
        <h3 class="p-name">${p.title}</h3>
        <div class="price-box">
          <span class="current-price"><span class="currency">৳</span>${p.price}</span>
          <span class="old-price"><span class="currency">৳</span>${p.oldPrice}</span>
        </div>
        <div class="save-text">
          Save - <span class="currency">৳</span>${p.oldPrice - p.price}
        </div>
      </div>
    </div>
  `;
}

/* ================= GLOBAL ================= */
window.openProductPage = id => {
  window.location.href = `/product.html?id=${id}`;
};
