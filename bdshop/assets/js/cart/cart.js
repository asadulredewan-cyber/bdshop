/* =========================================================
   CART.JS — ADVANCED VERSION (Select All & Dynamic Summary)
   ========================================================= */
import { auth, db } from "../core/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, doc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const cartItemsEl = document.getElementById("cartItems");
const cartItemCountEl = document.getElementById("cartItemCount");
const summarySubtotalEl = document.getElementById("summarySubtotal");
const summaryTotalEl = document.getElementById("summaryTotal");
const selectAllEl = document.getElementById("selectAllCart");
const CHECKBOX_CACHE_KEY = "cart_checked_items";
// Select All বাটন

let CART_STATE = []; // লোকাল স্টেট হিসেবে ডাটা রাখার জন্য

/* ================= AUTH GUARD ================= */
onAuthStateChanged(auth, async (user) => {
  const cartPage = document.querySelector(".cart-page");
  const overlay = document.querySelector(".auth-overlay");

  if (!user) {
    if (overlay) overlay.classList.add("active");
    if (cartPage) cartPage.style.display = "none"; // লগইন না থাকলে কন্টেন্ট হাইড
    return;
  }

  if (cartPage) cartPage.style.display = "block";
  await loadCartAndProducts(user.uid);
});

/* ================= DATA LOADING ================= */
async function loadCartAndProducts(uid) {
  try {
    const productRes = await fetch("../../../assets/json/products.json");
    const allProducts = await productRes.json();

    const cartRef = collection(db, "users", uid, "cart");
    const snap = await getDocs(cartRef);

    CART_STATE = [];
    cartItemsEl.innerHTML = "";

    if (snap.empty) {
      cartItemsEl.innerHTML = `<div style="text-align:center; padding:50px;">Your cart is empty!</div>`;
      updateSummary();
      return;
    }

    snap.forEach((docSnap) => {
      const cart = docSnap.data();
      const product = allProducts.find(p => String(p.id) === String(cart.productId));

      if (product) {

        // 👉 1. color ও size অনুযায়ী data বের করি
        const colorData = product.colorVariants?.[cart.color] || {};
        const sizeData = colorData.sizes?.[cart.size] || {};

        // 👉 2. final price resolve করি (priority wise)
        const finalPrice =
          sizeData.price ??
          product.price ??
          product.basePrice ??
          0;

        CART_STATE.push({
          docId: docSnap.id,
          ...cart,
          price: finalPrice,                       // ✅ FIXED
          image: colorData.image || product.image, // color image থাকলে সেটাই
          title: product.title
        });
      }

    });

    renderCartItems();
  } catch (err) {
    console.error("Cart Load Error:", err);
  }
  
}



function saveCheckedItems() {
  const checkedIds = Array.from(
    document.querySelectorAll(".item-checkbox:checked")
  ).map(cb => cb.dataset.id);

  localStorage.setItem(CHECKBOX_CACHE_KEY, JSON.stringify(checkedIds));
}
function restoreCheckedItems() {
  const saved = JSON.parse(
    localStorage.getItem(CHECKBOX_CACHE_KEY) || "[]"
  );

  document.querySelectorAll(".item-checkbox").forEach(cb => {
    cb.checked = saved.includes(cb.dataset.id);
  });
}

/* ================= RENDERING ================= */
function renderCartItems() {
  cartItemsEl.innerHTML = "";

  CART_STATE.forEach((item) => {
    const itemTotal = item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-left">
          <input type="checkbox" class="item-checkbox" data-id="${item.docId}">
          <img src="${item.image}" class="cart-item-img">
          <div class="cart-item-info">
            <h3 class="cart-item-name">${item.title}</h3>
            <p class="cart-item-variant">Color: ${item.color} | Size: ${item.size}</p>
            <p class="cart-item-price">৳ ${item.price}</p>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.docId}', ${item.qty - 1})">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.docId}', ${item.qty + 1})">+</button>
          </div>
          <div class="cart-total">৳ ${itemTotal}</div>
          
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  // চেকবক্স ইভেন্ট অ্যাড করা
  document.querySelectorAll(".item-checkbox").forEach(cb => {
  cb.onchange = () => {
    saveCheckedItems();   // ✅ SAVE
    updateSummary();
  };
});

restoreCheckedItems();
 updateSummary();


}

/* ================= LOGIC & ACTIONS ================= */

// ১. Select All / Unselect All
if (selectAllEl) {
  selectAllEl.onclick = () => {
    const checkboxes = document.querySelectorAll(".item-checkbox");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => cb.checked = !allChecked);

    saveCheckedItems();   // ✅ ADD THIS
    updateSummary();
  };
}


// ২. Dynamic Summary (সিলেক্ট করা পণ্যের হিসাব)
function updateSummary() {
  const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
  const allCheckboxes = document.querySelectorAll(".item-checkbox");

  let subtotal = 0;
  let count = 0;

  selectedCheckboxes.forEach(cb => {
    const docId = cb.getAttribute("data-id");
    const item = CART_STATE.find(i => i.docId === docId);
    if (item) {
      subtotal += (item.price * item.qty);
      count++;
    }
  });

  // UI আপডেট
  summarySubtotalEl.innerText = `৳ ${subtotal}`;
  summaryTotalEl.innerText = `৳ ${subtotal}`;
  cartItemCountEl.innerText = count;

  // Select All টেক্সট আপডেট
  if (selectAllEl && allCheckboxes.length > 0) {
    selectAllEl.innerText = (selectedCheckboxes.length === allCheckboxes.length) ? "Unselect All" : "Select All";
    
  }
  
}

// ৩. Delete Selected (সব সিলেক্ট করা পণ্য ডিলিট)


// ৪. সিঙ্গল আইটেম আপডেট ও ডিলিট
window.updateQty = async (docId, newQty) => {
  if (newQty < 1) return;
  const user = auth.currentUser;

  await updateDoc(doc(db, "users", user.uid, "cart", docId), { qty: newQty });

  saveCheckedItems();          // ✅ keep checked state
  loadCartAndProducts(user.uid);
};


/* ================= DELETE CUSTOM MODAL LOGIC ================= */
let itemToDelete = null; // কোন আইটেম ডিলিট হবে তা মনে রাখার জন্য
let isMultipleDelete = false; // সিঙ্গল না মাল্টিপল ডিলিট তা বোঝার জন্য

// ডিলিট মোডাল এলিমেন্ট
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// ১. সিঙ্গল আইটেম ডিলিট বাটন ক্লিক করলে


// ২. মাল্টিপল (Select All) ডিলিট বাটন ক্লিক করলে
window.deleteSelectedItems = () => {
  const selected = document.querySelectorAll(".item-checkbox:checked");

  // 👉 যদি কিছু select না করা থাকে
  if (selected.length === 0) {
    isMultipleDelete = false;
    itemToDelete = null;

    // custom message দেখানো
    document.getElementById("deleteModalText").innerText =
      "Please select at least one product to delete.";

    // Confirm button লুকিয়ে রাখি (কারণ delete হবে না)
    confirmDeleteBtn.style.display = "none";

    openDeleteModal();
    return;
  }

  // 👉 যদি select করা থাকে
  confirmDeleteBtn.style.display = "inline-block";
  document.getElementById("deleteModalText").innerText =
    "Do you really want to remove selected items from your cart?";

  isMultipleDelete = true;
  openDeleteModal();
};


// মোডাল ওপেন করা
function openDeleteModal() {
  deleteModal.classList.add("active"); // CSS অনুযায়ী active ক্লাস যোগ করুন
  deleteModal.style.display = "flex";  // যদি CSS এ display none থাকে
}

// মোডাল ক্লোজ করা
function closeDeleteModal() {
  deleteModal.classList.remove("active");
  deleteModal.style.display = "none";
  itemToDelete = null;
}

// ৩. মোডালের "YES" (Confirm) বাটনে ক্লিক করলে
confirmDeleteBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  if (isMultipleDelete) {
    // সব সিলেক্ট করা পণ্য ডিলিট
    const selected = document.querySelectorAll(".item-checkbox:checked");
    for (let cb of selected) {
      const docId = cb.getAttribute("data-id");
      await deleteDoc(doc(db, "users", user.uid, "cart", docId));
    }
  } else if (itemToDelete) {
    // শুধু একটি পণ্য ডিলিট
    await deleteDoc(doc(db, "users", user.uid, "cart", itemToDelete));
  }

  closeDeleteModal();
  loadCartAndProducts(user.uid); // ডাটা রিফ্রেশ
};

// ৪. মোডালের "NO" (Cancel) বাটনে ক্লিক করলে
cancelDeleteBtn.onclick = closeDeleteModal;

// মোডালের বাইরে ক্লিক করলে বন্ধ হবে
window.onclick = (event) => {
  if (event.target == deleteModal) closeDeleteModal();
};


// DELETE SELECTED BUTTON CLICK
const deleteSelectedBtn = document.getElementById("deleteSelected");

if (deleteSelectedBtn) {
  deleteSelectedBtn.addEventListener("click", () => {
    deleteSelectedItems();
  });
}






import {
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const checkoutBtn = document.getElementById("checkoutSelectedBtn");

if (checkoutBtn) {
  checkoutBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 1️⃣ checked checkbox গুলো ধরছি
    const checkedBoxes = document.querySelectorAll(".item-checkbox:checked");

   if (checkedBoxes.length === 0) {
  document.getElementById("deleteModalText").innerText =
    "Please select at least one product to proceed to checkout.";

  // Confirm button hide (কারণ delete / action কিছুই হবে না)
  confirmDeleteBtn.style.display = "none";

  openDeleteModal(); // existing modal open function
  return;
}


    // 2️⃣ checked item থেকে actual cart data বানাচ্ছি
    const selectedItems = [];

    checkedBoxes.forEach(cb => {
      const docId = cb.dataset.id;
      const item = CART_STATE.find(i => i.docId === docId);
      if (item) {
        selectedItems.push({
          productId: item.productId,
          title: item.title,
          color: item.color,
          size: item.size,
          qty: item.qty,
          price: item.price,
          image: item.image
        });
      }
    });

    // 3️⃣ Firestore-এ checkout session বানাচ্ছি
    const ref = await addDoc(
      collection(db, "users", user.uid, "checkout_sessions"),
      {
        items: selectedItems,
        createdAt: serverTimestamp()
      }
    );

    // 4️⃣ checkout page-এ পাঠাচ্ছি
    window.location.href = `checkout.html?sid=${ref.id}`;
  };
}
