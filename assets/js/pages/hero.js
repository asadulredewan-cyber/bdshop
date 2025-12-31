// assets/js/pages/hero.js
// ======================================================
// HERO SLIDER (GitHub Pages Safe)
// ======================================================

let heroClickBound = false;

/* ================= LOAD HERO ================= */
export async function loadHero() {
  try {
    // 🔹 GitHub Pages compatible relative path
    const res = await fetch("./assets/json/hero.json");
    if (!res.ok) throw new Error("hero.json not found");

    const slides = await res.json();

    renderHeroSlides(slides);
    initSwiper();
  } catch (err) {
    console.error("Hero load failed:", err);
  }
}

/* ================= RENDER SLIDES ================= */
function renderHeroSlides(slides) {
  const wrapper = document.getElementById("hero-slider-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = slides
    .map(slide => `
      <div class="swiper-slide slider-box"
           data-type="${slide.type}"
           data-id="${slide.id}"
           style="background-color:${slide.bgColor || "#ffffff"}">

        <div class="slider-content">
          <p class="sub-title">${slide.subtitle || ""}</p>
          <h1 class="main-title">${slide.title || ""}</h1>
          <p class="offer-text">${slide.offer || ""}</p>
        </div>

        <div class="slider-image">
          <img src="${slide.image}" alt="${slide.title || ""}">
        </div>
      </div>
    `)
    .join("");

  // 🔹 bind click only once
  if (!heroClickBound) {
    wrapper.addEventListener("click", onHeroClick);
    heroClickBound = true;
  }
}

/* ================= HERO CLICK HANDLER ================= */
function onHeroClick(e) {
  const slideEl = e.target.closest(".swiper-slide");
  if (!slideEl) return;

  const { type, id } = slideEl.dataset;
  handleHeroClick(type, id);
}

/* ================= NAVIGATION LOGIC ================= */
function handleHeroClick(type, id) {
  if (!type || !id) return;

  if (type === "category") {
    // 🔹 category → home filter
    window.location.href =
      `./index.html?category=${encodeURIComponent(id)}`;
  } 
  else if (type === "product") {
  window.location.href =
    `./product.html?pid=${encodeURIComponent(id)}`;
}

}

/* ================= SWIPER INIT ================= */
function initSwiper() {
  if (typeof Swiper === "undefined") {
    console.warn("Swiper not loaded");
    return;
  }

  new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: {
      el: ".custom-dots",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    }
  });
}
