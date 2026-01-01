/* ======================================================
   HEADER NAV + SIDEBAR MENU
====================================================== */

/* ---------- ELEMENTS ---------- */
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileSearchBtn = document.getElementById('mobileSearchBtn');
const searchBox = document.querySelector('.center');
const categoryNav = document.querySelector('.category-nav');
const categoryContainer = document.querySelector('.category-container');

/* ---------- SIDEBAR CREATE ---------- */
const sidebarBackdrop = document.createElement('div');
sidebarBackdrop.className = 'sidebar-backdrop';
document.body.appendChild(sidebarBackdrop);

const sidebarMenu = document.createElement('div');
sidebarMenu.className = 'sidebar-menu';
sidebarMenu.innerHTML = `
  <div class="sidebar-header">
    <h2>All Categories</h2>
    <button class="close-sidebar">
      <i class="fa-solid fa-times"></i>
    </button>
  </div>
  <div class="sidebar-category">
    ${categoryContainer ? categoryContainer.innerHTML : ''}
  </div>
`;
document.body.appendChild(sidebarMenu);

const closeSidebarBtn = sidebarMenu.querySelector('.close-sidebar');

/* ---------- SIDEBAR OPEN / CLOSE ---------- */
function openSidebar() {
  sidebarMenu.classList.add('active');
  sidebarBackdrop.classList.add('active');
}

function closeSidebar() {
  sidebarMenu.classList.remove('active');
  sidebarBackdrop.classList.remove('active');
}

/* ---------- EVENTS ---------- */
hamburgerMenu?.addEventListener('click', openSidebar);
closeSidebarBtn?.addEventListener('click', closeSidebar);
sidebarBackdrop?.addEventListener('click', closeSidebar);

/* ---------- MOBILE SEARCH ---------- */
mobileSearchBtn?.addEventListener('click', () => {
  searchBox?.classList.toggle('active');
  closeSidebar();
});

/* ---------- CATEGORY CLICK (TOP + SIDEBAR) ---------- */
document.addEventListener('click', (e) => {
  const target = e.target.closest('.category-item, .sidebar-category-item, .category-item-fotter');
  if (!target) return;

  const selectedCategory = target.textContent.trim();

  // যদি অন্য পেজে থাকে → index এ পাঠাবে
  if (
    !window.location.pathname.endsWith('./index.html') &&
    window.location.pathname !== '/'
  ) {
    window.location.href =
      `./index.html?category=${encodeURIComponent(selectedCategory)}`;
    return;
  }

  // index page এ থাকলে → filter
  if (typeof displayFilteredProducts === 'function') {
    displayFilteredProducts(selectedCategory);
  }

  if (typeof updateActiveClass === 'function') {
    updateActiveClass(selectedCategory);
  }

  if (window.innerWidth <= 768) {
    closeSidebar();
  }
});

/* ---------- ACTIVE CLASS UPDATE ---------- */
window.updateActiveClass = function (categoryText) {
  document
    .querySelectorAll('.category-item, .sidebar-category-item')
    .forEach(item => {
      item.classList.toggle(
        'active',
        item.textContent.trim() === categoryText
      );
    });
};
/* =========================
   HEADER SEARCH LOGIC
========================= */

const searchInput = document.querySelector('.input-field');
const searchIcon = document.querySelector('.icon-search');

function performSearch() {
  const query = searchInput?.value.trim();
  if (!query) return;

  // optional: remember last search
  localStorage.setItem('lastSearch', query);

  // always go to index with search query
  window.location.href =
    `./index.html?search=${encodeURIComponent(query)}`;
}


function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category");
}










/* click on icon */
searchIcon?.addEventListener('click', performSearch);

/* press Enter */
searchInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const cat = getCategoryFromURL();
  if (!cat) return;

  if (typeof updateActiveClass === "function") {
    updateActiveClass(cat);
  }
});

