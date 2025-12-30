import { auth, db, } from "../core/firebase.js";


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ADD TO CART ================= */

window.handleAddToCart = async function () {
  const btn = document.getElementById("addToCartBtn");
  if (!btn || btn.disabled) return;

  const user = auth.currentUser;

  /* ---------- NOT LOGGED IN ---------- */
  if (!user) {
    const overlay = document.querySelector(".auth-overlay");
    if (overlay) overlay.classList.add("active");
    return; // ⬅️ button state change করার আগেই return
  }

  /* ---------- VALIDATION ---------- */
  if (!PRODUCT || !SELECTED.color || !SELECTED.size) {
    alert("Please select color and size");
    return;
  }

  /* ---------- BUTTON LOADING (AFTER LOGIN CONFIRMED) ---------- */
  btn.disabled = true;
  const oldText = btn.innerText;
  btn.innerText = "ADDING.....";

  try {
    const uid = user.uid;
    const docId = `${PRODUCT.id}_${SELECTED.color}_${SELECTED.size}`;

    const cartRef = doc(db, "users", uid, "cart", docId);
    const snap = await getDoc(cartRef);

    let finalQty = QTY;
    if (snap.exists()) {
      finalQty = snap.data().qty + QTY;
    }

    await setDoc(cartRef, {
      productId: PRODUCT.id,
      color: SELECTED.color,
      size: SELECTED.size,
      qty: finalQty,
      addedAt: serverTimestamp()
    });

    btn.innerText = "Added ✓";
    setTimeout(() => {
      btn.innerText = oldText;
      btn.disabled = false;
    }, 700);

  } catch (err) {
    console.error("Add to cart error:", err);
    btn.innerText = oldText;
    btn.disabled = false;
    alert("Failed to add to cart");
  }
};

