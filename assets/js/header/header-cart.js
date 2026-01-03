/* =====================================================
   profile_badge.js
   Profile Name + Cart Badge
   Cache-first + Realtime Firestore sync
===================================================== */

import { auth, db } from "../core/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";





startPageLoad(); // 🔥 loader starts

onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      await loadUserName(user.uid);
    }
  } finally {
    endPageLoad(); // 🔥 loader ends
  }
});
/* ================= ELEMENTS ================= */
const loginBtn = document.getElementById("openLoginBtn");
const loginText = loginBtn?.querySelector("span");
const cartAction = document.getElementById("cartAction");
const cartBadge = document.getElementById("cartQtyBadge");

/* ================= GLOBAL USER ================= */
window.CURRENT_USER = null;

/* ================= HELPERS ================= */

/* ---- UI: Cart Badge ---- */
function showCartQty(qty) {
  if (!cartBadge) return;

  if (qty > 0) {
    cartBadge.innerText = qty;
    cartBadge.style.display = "flex";
  } else {
    cartBadge.style.display = "none";
  }
}

/* ---- Cache helpers ---- */
function getCachedCartQty(uid) {
  return Number(localStorage.getItem(`cartQty_${uid}`)) || 0;
}

function setCachedCartQty(uid, qty) {
  localStorage.setItem(`cartQty_${uid}`, qty);
}

function getCachedUserName(uid) {
  return localStorage.getItem(`userName_${uid}`);
}

function setCachedUserName(uid, name) {
  localStorage.setItem(`userName_${uid}`, name);
}

/* ================= REALTIME SYNC ================= */

/* ---- Profile name realtime ---- */
function syncProfile(uid) {
  const profileRef = doc(db, "users", uid, "profile", "data");

  onSnapshot(profileRef, (snap) => {
    if (!snap.exists()) return;

    const name = snap.data().firstName || "User";

    // cache update
    setCachedUserName(uid, name);

    // UI update
    if (loginText) loginText.innerText = name;
  });
}

/* ---- Cart qty realtime ---- */
function syncCart(uid) {
  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, (snap) => {
    let total = 0;

    snap.forEach(doc => {
      total += doc.data().qty || 0;
    });

    // cache update
    setCachedCartQty(uid, total);

    // UI update
    showCartQty(total);
  });
}

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    window.CURRENT_USER = user;

    /* ---- 1️⃣ Instant UI from cache ---- */
    const cachedName = getCachedUserName(uid);
    if (cachedName && loginText) {
      loginText.innerText = cachedName;
    }

    const cachedQty = getCachedCartQty(uid);
    showCartQty(cachedQty);

    /* ---- 2️⃣ Background realtime sync ---- */
    syncProfile(uid);
    syncCart(uid);

  } else {
    window.CURRENT_USER = null;

    if (loginText) loginText.innerText = "Sign Up/Sign In";
    if (cartBadge) cartBadge.style.display = "none";
  }
});

/* ================= CLICK HANDLERS ================= */

/* Profile / Login */
loginBtn?.addEventListener("click", () => {
  if (window.CURRENT_USER) {
    window.location.href = "./profile.html";
  } else {
    document.querySelector(".auth-overlay")?.classList.add("active");
  }
});

/* Cart */
cartAction?.addEventListener("click", () => {
  if (!window.CURRENT_USER) {
    document.querySelector(".auth-overlay")?.classList.add("active");
  } else {
    window.location.href = "./cart.html";
  }
});

