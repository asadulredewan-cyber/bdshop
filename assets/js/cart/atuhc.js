import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "../core/firebase.js";

/* ---------- AUTH CHECK FOR CART PAGE ---------- */
onAuthStateChanged(auth, (user) => {
  const overlay = document.querySelector(".auth-overlay");
  const cartPage = document.querySelector(".cart-page"); // আপনার মেইন কন্টেন্ট ক্লাস
  
  if (!user) {
    if (overlay) {
      overlay.classList.add("active");
      if (cartPage) cartPage.style.display = "none"; // কন্টেন্ট লুকিয়ে ফেলবে
      const closeBtn = document.querySelector(".auth-close");
      if (closeBtn) closeBtn.style.display = "none";
    }
  } else {
    if (overlay) overlay.classList.remove("active");
    if (cartPage) cartPage.style.display = "block"; // লগইন থাকলে দেখাবে
  }
});