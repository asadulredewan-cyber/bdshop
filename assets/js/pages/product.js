// assets/js/pages/product.js

import { state, setProducts } from "../core/state.js";

const grid = document.getElementById("product-display-grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const catNameEl = document.getElementById("current-cat-name");

let ALL_PRODUCTS = [];

/* ================= LOAD PRODUCTS ================= */
export async function loadProducts() {
  try {
    const res = await fetch("./assets/json/products.json");
    const data = await res.json();

    ALL_PRODUCTS = data;
    setProducts(data);

    // 🔁 URL category restore
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get("category");

    if (urlCategory) {
      displayFilteredProducts(urlCategory);
    } else {
      renderProducts(data);
      updateCategoryTitle("All Categories");
    }

  } catch (err) {
    console.error("Product load failed:", err);
  }
}

/* ================= FILTER BY CATEGORY ================= */
window.displayFilteredProducts = function (categoryText) {
  clearGrid();

  let filtered;

  if (
    categoryText.toLowerCase() === "all categories" ||
    categoryText.toLowerCase() === "all"
  ) {
    filtered = ALL_PRODUCTS;
  } else {
    filtered = ALL_PRODUCTS.filter(p =>
      p.category?.toLowerCase() === categoryText.toLowerCase()
    );
  }

  renderProducts(filtered);
  updateCategoryTitle(categoryText);
};

/* ================= UPDATE TITLE ================= */
function updateCategoryTitle(text) {
  if (!catNameEl) return;
  catNameEl.innerText = text;
}

/* ================= RENDER ================= */
function renderProducts(products) {
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `<p style="text-align:center">No products found</p>`;
    return;
  }

  grid.innerHTML = products.map(productCard).join("");
}

/* ================= CLEAR ================= */
function clearGrid() {
  if (grid) grid.innerHTML = "";
}

/* ================= CARD ================= */
function productCard(p) {
  return `
    <div class="product-card" onclick="openProductPage(${p.id})">
      <div class="discount-badge">${p.discount || ""}</div>
      <div class="product-image">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="product-info">
        <h3 class="p-name">${p.title}</h3>
        <div class="price-box">
          <span class="current-price">৳${p.price}</span>
          ${
            p.oldPrice
              ? `<span class="old-price">৳${p.oldPrice}</span>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

/* ================= GLOBAL ================= */
window.openProductPage = id => {
  window.location.href = `./product.html?id=${id}`;
};

