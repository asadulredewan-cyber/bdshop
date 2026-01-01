// assets/js/pages/product.js

import { state, setProducts } from "../core/state.js";

const grid = document.getElementById("product-display-grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const catNameEl = document.getElementById("current-cat-name");


let ORIGINAL_PRODUCTS = [];

let ALL_PRODUCTS = [];
let VISIBLE_COUNT = 10;
const LOAD_STEP = 10;

/* ================= LOAD PRODUCTS ================= */
export async function loadProducts() {
  try {
    const res = await fetch("./assets/json/products.json");
    const data = await res.json();

    ORIGINAL_PRODUCTS = data.filter(p =>
      p &&
      p.productId &&
      p.title &&
      p.image &&
      typeof p.price === "number"
    );

    ALL_PRODUCTS = [...ORIGINAL_PRODUCTS];
    setProducts(ALL_PRODUCTS);

    VISIBLE_COUNT = 10;

    // 🔑 URL category থাকলে সেটা use করো
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");

    if (cat) {
      displayFilteredProducts(cat);
    } else {
      renderProducts();
      toggleLoadMoreBtn();
      updateCategoryTitle("All Categories");
    }

  } catch (err) {
    console.error("Product load failed:", err);
  }
}


/* ================= FILTER BY CATEGORY ================= */
window.displayFilteredProducts = function (categoryText) {
  clearGrid();
  VISIBLE_COUNT = 10;

  let filtered;

  if (
    categoryText.toLowerCase() === "all categories" ||
    categoryText.toLowerCase() === "all"
  ) {
    filtered = [...ORIGINAL_PRODUCTS];
  } else {
    filtered = ORIGINAL_PRODUCTS.filter(p =>
      p.category?.toLowerCase() === categoryText.toLowerCase()
    );
  }

  ALL_PRODUCTS = filtered;
  renderProducts();
  toggleLoadMoreBtn();
  updateCategoryTitle(categoryText);
};



/* ================= UPDATE TITLE ================= */
function updateCategoryTitle(text) {
  if (!catNameEl) return;
  catNameEl.innerText = text;
}

/* ================= RENDER ================= */
function renderProducts() {
  if (!grid) return;

  const visible = ALL_PRODUCTS.slice(0, VISIBLE_COUNT);

  if (!visible.length) {
    grid.innerHTML = `<p style="text-align:center">No products found</p>`;
    return;
  }

  grid.innerHTML = visible.map(productCard).join("");
}


/* ================= CLEAR ================= */
function clearGrid() {
  if (grid) grid.innerHTML = "";
}

/* ================= CARD ================= */
function productCard(p) {
  return `
    <div class="product-card" onclick="openProductPage(${p.productId})">
      ${p.discount ? `<div class="discount-badge">${p.discount}</div>` : ""}

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
window.openProductPage = pid => {
  window.location.href = `./product.html?pid=${pid}`;
};

if (loadMoreBtn) {
  loadMoreBtn.onclick = () => {
    VISIBLE_COUNT += LOAD_STEP;
    renderProducts();
    toggleLoadMoreBtn();
  };
}

function toggleLoadMoreBtn() {
  if (!loadMoreBtn) return;

  loadMoreBtn.style.display =
    VISIBLE_COUNT >= ALL_PRODUCTS.length
      ? "none"
      : "block";
}
