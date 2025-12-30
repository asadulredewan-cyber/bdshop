/* ---------- STATE ---------- */
window.CURRENT_IMAGE = null;
window.GALLERY_IMAGES = [];


window.QTY = 1; // let এর বদলে window.QTY দিন
window.PRODUCT = null; 
window.SELECTED = {
  color: null,
  size: null
};
/* ---------- HELPERS ---------- */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function $(id) {
  return document.getElementById(id);
}

/* ---------- LOAD PRODUCT ---------- */
async function loadProductDetails() {
  const productId = getParam("id");
  const container = $("product-content");

  if (!productId) {
    container.innerHTML = `<p style="text-align:center">Invalid product</p>`;
    return;
  }

  try {
    const res = await fetch("../../../assets/json/products.json");
    const products = await res.json();

    PRODUCT = products.find(p => String(p.id) === String(productId));

    if (!PRODUCT) {
      container.innerHTML = `<p style="text-align:center">Product not found</p>`;
      return;
    }

    initDefaultSelection();
    renderProduct();
    renderSpecifications(PRODUCT.specifications);
    renderRecommended(products, PRODUCT.id);

  } catch (err) {
    console.error("Product load failed:", err);
    container.innerHTML = `<p style="text-align:center">Failed to load product</p>`;
  }
}

/* ---------- DEFAULT VARIANT ---------- */
function initDefaultSelection() {
  const colors = Object.keys(PRODUCT.colorVariants || {});
  SELECTED.color = colors[0] || null;

  const sizes =
    PRODUCT.colorVariants?.[SELECTED.color]?.sizes
      ? Object.keys(PRODUCT.colorVariants[SELECTED.color].sizes)
      : [];

  SELECTED.size = sizes[0] || null;
}

/* ---------- RENDER PRODUCT ---------- */
function renderProduct() {
  const container = $("product-content");

  const colorData = PRODUCT.colorVariants?.[SELECTED.color] || {};
  const sizeData = colorData.sizes?.[SELECTED.size] || {};

  const price =
    sizeData.price ??
    PRODUCT.price ??
    PRODUCT.basePrice ??
    0;

  const oldPrice =
    sizeData.oldPrice ??
    PRODUCT.oldPrice ??
    null;

  /* ---------- MAIN IMAGE RESOLUTION ---------- */
  const baseImage = PRODUCT.image;
  const colorImage = colorData.image || null;

  if (!CURRENT_IMAGE) {
    // first page load
    CURRENT_IMAGE = baseImage;
  }

  /* ---------- GALLERY (ROOT ONLY) ---------- */
  const galleryImages = [
    baseImage,
    ...(PRODUCT.gallery || [])
  ].filter((v, i, a) => a.indexOf(v) === i);
window.GALLERY_IMAGES = galleryImages;

  container.innerHTML = `
    <div class="p-image-side">

      <div class="main-img-container">
        <img id="main-product-img"
             src="${CURRENT_IMAGE}"
             alt="${PRODUCT.title}">
      </div>

    <div class="thumb-wrapper">

  <button class="thumb-nav left" onclick="scrollThumbs(-1)">
    &#10094;
  </button>

  <div class="thumb-slider" id="thumbSlider">
    ${galleryImages.map(img => `
      <img src="${img}"
           class="thumb-img ${img === CURRENT_IMAGE ? "active" : ""}"
           onclick="changeMainImage('${img}')">
    `).join("")}
  </div>

  <button class="thumb-nav right" onclick="scrollThumbs(1)">
    &#10095;
  </button>

</div>


    </div>

    <div class="p-info-side">
      <div class="p-meta">
        Category: ${PRODUCT.category}
        <span class="stock-status">In Stock</span>
      </div>

      <h1 class="p-title">${PRODUCT.title}</h1>

      <div class="p-price-row">
        <span class="p-current-price">
          ৳<span id="display-price">${price}</span>
        </span>
        ${
          oldPrice && oldPrice > price
            ? `<span class="p-old-price">৳${oldPrice}</span>`
            : ""
        }
      </div>

      ${renderColorOptions()}
      ${renderSizeOptions()}

      <div class="qty-action-wrap">
        <div class="qty-box">
          <button type="button" onclick="changeQty(-1)">−</button>
          <span id="qty-value">${QTY}</span>
          <button type="button" onclick="changeQty(1)">+</button>
        </div>

        <div class="action-btns">
          <button class="buy-now">Buy Now</button>
          <button class="add-cart"
                  id="addToCartBtn"
                  onclick="handleAddToCart()">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}




window.changeQty = function (delta) {
  QTY = QTY + delta;
  if (QTY < 1) QTY = 1;

  const qtyEl = document.getElementById("qty-value");
  if (qtyEl) qtyEl.innerText = QTY;
};

/* ---------- COLOR OPTIONS ---------- */
function renderColorOptions() {
  const colors = Object.keys(PRODUCT.colorVariants || {});
  if (!colors.length) return "";

  return `
    <div class="variant-box color-section">
      <span class="variant-label">Choose Color:</span>
      <div class="v-options">
        ${colors.map(c => `
          <div class="v-opt ${c === SELECTED.color ? "active" : ""}"
               onclick="changeColor('${c}')">${c}</div>
        `).join("")}
      </div>
    </div>
  `;
}

/* ---------- SIZE OPTIONS ---------- */
function renderSizeOptions() {
  const sizes =
    PRODUCT.colorVariants?.[SELECTED.color]?.sizes
      ? Object.keys(PRODUCT.colorVariants[SELECTED.color].sizes)
      : [];

  if (!sizes.length) return "";

  return `
    <div class="variant-box size-section">
      <span class="variant-label">Choose Size:</span>
      <div class="v-options">
        ${sizes.map(s => `
          <div class="v-opt ${s === SELECTED.size ? "active" : ""}"
               onclick="changeSize('${s}')">${s}</div>
        `).join("")}
      </div>
    </div>
  `;
}

/* ---------- VARIANT CHANGE ---------- */
window.changeColor = function (color) {
  SELECTED.color = color;

  const sizes = Object.keys(
    PRODUCT.colorVariants[color]?.sizes || {}
  );
  SELECTED.size = sizes[0] || null;

  // 🔥 exact rule you asked
  CURRENT_IMAGE =
    PRODUCT.colorVariants[color]?.image ||
    PRODUCT.image;

  renderProduct();
};


window.changeSize = function (size) {
  SELECTED.size = size;
  renderProduct();
};
/* ---------- SPECIFICATIONS ---------- */


/* ---------- RECOMMENDED PRODUCTS ---------- */
function renderRecommended(products, currentId) {
  const grid = $("random-products-grid");
  if (!grid) return;

  const list = products
    .filter(p => p.id !== currentId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  grid.innerHTML = list.map(p => `
    <div class="product-card"
         onclick="location.href='product.html?id=${p.id}'">
      ${p.discount ? `<div class="discount-badge">${p.discount}</div>` : ""}
      <div class="product-image">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="product-info">
        <h3 class="p-name">${p.title}</h3>
        <div class="price-box">
          <span class="current-price">৳${p.price ?? p.basePrice ?? 0}</span>
          ${p.oldPrice ? `<span class="old-price">৳${p.oldPrice}</span>` : ""}
        </div>
      </div>
    </div>
  `).join("");
}

/* ======================================================
   PRODUCT SPECIFICATIONS
   ====================================================== */

/* ---------- RENDER SPECS ---------- */
window.renderSpecifications = function (specs = []) {
  const container = document.getElementById("specs-list");
  if (!container || !Array.isArray(specs) || specs.length === 0) {
    if (container) container.innerHTML = "";
    return;
  }

  const hasMoreThanSeven = specs.length > 7;

  container.innerHTML = `
    <div id="specs-content-wrapper" class="specs-collapsed">
      ${specs.map(s => `
        <div class="spec-row">
          <span class="spec-label">${s.label}</span>
          <span class="spec-value">${s.value}</span>
        </div>
      `).join("")}
    </div>
    ${
      hasMoreThanSeven
        ? `<button id="spec-toggle-btn"
                   class="see-more-link"
                   type="button"
                   onclick="toggleSpecs()">See More ▾</button>`
        : ""
    }
  `;
};

/* ---------- TOGGLE ---------- */
window.toggleSpecs = function () {
  const wrapper = document.getElementById("specs-content-wrapper");
  const btn = document.getElementById("spec-toggle-btn");
  if (!wrapper || !btn) return;

  const collapsed = wrapper.classList.toggle("specs-collapsed");
  btn.innerText = collapsed ? "See More ▾" : "Show Less ▴";
};



window.changeMainImage = function (img) {
  CURRENT_IMAGE = img;

  const mainImg = document.getElementById("main-product-img");
  if (mainImg) {
    mainImg.style.opacity = 0;
    setTimeout(() => {
      mainImg.src = img;
      mainImg.style.opacity = 1;
    }, 120);
  }

  document.querySelectorAll(".thumb-img").forEach(t =>
    t.classList.toggle("active", t.src === img)
  );
};





window.scrollThumbs = function (dir) {
  if (!GALLERY_IMAGES.length) return;

  const currentIndex = GALLERY_IMAGES.indexOf(CURRENT_IMAGE);
  if (currentIndex === -1) return;

  let nextIndex = currentIndex + dir;

  // loop behavior (Daraz style)
  if (nextIndex < 0) {
    nextIndex = GALLERY_IMAGES.length - 1;
  }
  if (nextIndex >= GALLERY_IMAGES.length) {
    nextIndex = 0;
  }

  const nextImage = GALLERY_IMAGES[nextIndex];

  changeMainImage(nextImage);

  // thumbnail auto scroll into view
  const thumbs = document.querySelectorAll(".thumb-img");
  if (thumbs[nextIndex]) {
    thumbs[nextIndex].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
};

const productId = new URLSearchParams(location.search).get("id");


/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", loadProductDetails);
