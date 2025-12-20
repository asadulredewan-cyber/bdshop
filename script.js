// এলিমেন্ট সিলেক্ট
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileSearchBtn = document.getElementById('mobileSearchBtn');
const searchBox = document.querySelector('.center');
const categoryNav = document.querySelector('.category-nav');

// সাইডবার এলিমেন্ট তৈরি
const sidebarBackdrop = document.createElement('div');
sidebarBackdrop.className = 'sidebar-backdrop';
document.body.appendChild(sidebarBackdrop);

const sidebarMenu = document.createElement('div');
sidebarMenu.className = 'sidebar-menu';

// সাইডবারে মূল category-nav এর কন্টেন্ট ব্যবহার
const categoryContainer = document.querySelector('.category-container');
sidebarMenu.innerHTML = `
  <div class="sidebar-header">
    <h2>All Categories</h2>
    <button class="close-sidebar">
      <i class="fa-solid fa-times"></i>
    </button>
  </div>
  <div class="sidebar-category">
    ${categoryContainer.innerHTML}
  </div>
`;

document.body.appendChild(sidebarMenu);

const closeSidebarBtn = document.querySelector('.close-sidebar');
const sidebarCategoryItems = document.querySelectorAll('.sidebar-category-item');
const mainCategoryItems = document.querySelectorAll('.category-item');

// হ্যামবার্গার মেনু ক্লিক ইভেন্ট - সাইডবার টগল
hamburgerMenu.addEventListener('click', function(e) {
  e.stopPropagation();
  
  // সাইডবার টগল
  sidebarMenu.classList.toggle('active');
  sidebarBackdrop.classList.toggle('active');
  
  // সার্চ বক্স খোলা থাকলে বন্ধ করুন
  if (searchBox.classList.contains('active')) {
    searchBox.classList.remove('active');
  }
});

// সাইডবার বন্ধ করার ফাংশন
function closeSidebar() {
  sidebarMenu.classList.remove('active');
  sidebarBackdrop.classList.remove('active');
}

// ক্লোজ বাটনে ক্লিক
closeSidebarBtn.addEventListener('click', closeSidebar);

// ব্যাকড্রপে ক্লিক
sidebarBackdrop.addEventListener('click', closeSidebar);

// মোবাইল সার্চ বাটন ক্লিক ইভেন্ট
if (mobileSearchBtn) {
  mobileSearchBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // সার্চ বক্স টগল
    searchBox.classList.toggle('active');
    
    // সাইডবার খোলা থাকলে বন্ধ করুন
    if (sidebarMenu.classList.contains('active')) {
      closeSidebar();
    }
  });
}

// কারেন্টলি সিলেক্টেড ক্যাটাগরি ট্র্যাক রাখার ফাংশন
let currentSelectedCategory = 'Groceries'; // ডিফল্ট হিসেবে

// ক্যাটাগরি সিলেক্ট করার ফাংশন (সাইডবার এবং মূল নেভ উভয়ে আপডেট করে)
function selectCategory(categoryText, clickedElement = null) {
  // ১. সব জায়গা থেকে আগের active ক্লাস রিমুভ
  sidebarCategoryItems.forEach(item => item.classList.remove('active'));
  mainCategoryItems.forEach(item => item.classList.remove('active'));
  
  // ২. কারেন্ট সিলেক্টেড আপডেট
  currentSelectedCategory = categoryText;
  
  // ৩. যদি ক্লিক করা এলিমেন্ট দেয়া থাকে (সাইডবার থেকে ক্লিক)
  if (clickedElement) {
    clickedElement.classList.add('active');
    
    // মূল category-nav এও একই ক্যাটাগরি খুঁজে active করো
    mainCategoryItems.forEach(item => {
      if (item.textContent.trim() === categoryText) {
        item.classList.add('active');
      }
    });
  } else {
    // অথবা যদি ফাংশন থেকে কল করা হয়
    sidebarCategoryItems.forEach(item => {
      if (item.textContent.trim() === categoryText) {
        item.classList.add('active');
      }
    });
    
    mainCategoryItems.forEach(item => {
      if (item.textContent.trim() === categoryText) {
        item.classList.add('active');
      }
    });
  }
  
  // ৪. কনসোলে লগ (ডিবাগিং এর জন্য)
  console.log('Selected Category:', currentSelectedCategory);
}

// সাইডবার ক্যাটাগরি আইটেম ক্লিক
sidebarCategoryItems.forEach(item => {
  item.addEventListener('click', function() {
    const categoryText = this.textContent.trim();
    
    // ক্যাটাগরি সিলেক্ট করো
    selectCategory(categoryText, this);
    
    // মোবাইলে ক্লিক করলে সাইডবার বন্ধ
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  });
});

// মূল category-nav আইটেম ক্লিক (যদি সরাসরি ক্লিক করা হয়)
mainCategoryItems.forEach(item => {
  item.addEventListener('click', function() {
    const categoryText = this.textContent.trim();
    
    // ক্যাটাগরি সিলেক্ট করো
    selectCategory(categoryText);
    
    // মোবাইলে ক্লিক করলে category-nav হাইড (যদি দেখা যায়)
    if (window.innerWidth <= 768 && categoryNav.classList.contains('active')) {
      categoryNav.classList.remove('active');
    }
  });
});

// সার্চ বক্সের বাইরে ক্লিক করলে বন্ধ হোক
document.addEventListener('click', function(e) {
  // যদি সার্চ বক্স, সার্চ বাটন বা সার্চ আইকনে ক্লিক না হয়
  const searchIcon = document.querySelector('.icon-search');
  if (!searchBox.contains(e.target) && 
      (!mobileSearchBtn || !mobileSearchBtn.contains(e.target)) &&
      (!searchIcon || !searchIcon.contains(e.target))) {
    
    // সার্চ বক্স বন্ধ করুন
    if (searchBox.classList.contains('active')) {
      searchBox.classList.remove('active');
    }
  }
  
  // যদি সাইডবার বা হ্যামবার্গারে ক্লিক না হয়
  if (!sidebarMenu.contains(e.target) && 
      !hamburgerMenu.contains(e.target) &&
      !sidebarBackdrop.contains(e.target)) {
    
    // সাইডবার বন্ধ করুন
    if (sidebarMenu.classList.contains('active')) {
      closeSidebar();
    }
  }
});

// ESC কী প্রেস করলে মেনু বন্ধ
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // সাইডবার বন্ধ
    if (sidebarMenu.classList.contains('active')) {
      closeSidebar();
    }
    
    // সার্চ বক্স বন্ধ
    if (searchBox.classList.contains('active')) {
      searchBox.classList.remove('active');
    }
  }
});

// রেসাইজ ইভেন্ট
window.addEventListener('resize', function() {
  // ল্যাপটাপ ভিউতে গেলে সাইডবার বন্ধ
  if (window.innerWidth > 768 && sidebarMenu.classList.contains('active')) {
    closeSidebar();
  }
});

// পেজ লোড হলে ডিফল্ট ক্যাটাগরি সেট করো
document.addEventListener('DOMContentLoaded', function() {
  // ডিফল্ট হিসেবে Groceries সিলেক্ট করো
  selectCategory('Groceries');
});







async function loadHeroFromJSON() {
  try {
    const res = await fetch("./hero.json"); // root folder
    const slides = await res.json();
    renderHeroSlides(slides);
  } catch (e) {
    console.error("Hero JSON load failed", e);
  }
}


document.addEventListener("DOMContentLoaded", function () {
  loadHeroFromJSON();

  new Swiper(".mySwiper", {
    loop: true,
    speed: 800,
    autoplay: { delay: 5000 },
    pagination: { el: ".custom-dots", clickable: true },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
});


// ২. স্লাইড রেন্ডার করার ফাংশন
function renderHeroSlides(slides) {
  const wrapper = document.getElementById("hero-slider-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = slides.map(slide => `
    <div class="swiper-slide slider-box"
         style="background-color:${slide.bgColor}; cursor:pointer"
         onclick="handleHeroClick('${slide.type}','${slide.id}')">
      <div class="slider-content">
        <p class="sub-title">${slide.subtitle}</p>
        <h1 class="main-title">${slide.title}</h1>
        <p class="offer-text">${slide.offer}</p>
      </div>
      <div class="slider-image">
        <img src="${slide.image}" alt="${slide.title}">
      </div>
    </div>
  `).join("");
}


// ৩. ক্লিক হ্যান্ডলার ফাংশন (যেখানে আইডি অনুযায়ী অ্যাকশন হবে)
window.handleHeroClick = function(type, id) {
  console.log(`Opening ${type} with ID: ${id}`);
  
  if(type === 'category') {
    // উদাহরণ: আপনার ক্যাটাগরি পেজে নিয়ে যাবে
    window.location.href = `/category.html?id=${id}`;
  } else {
    // উদাহরণ: নির্দিষ্ট প্রোডাক্ট পেজে নিয়ে যাবে
    window.location.href = `/product.html?id=${id}`;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  loadHeroFromJSON();

  new Swiper(".mySwiper", {
    loop: true,
    speed: 800,
    autoplay: { delay: 5000 },
    pagination: { el: ".custom-dots", clickable: true },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
});
