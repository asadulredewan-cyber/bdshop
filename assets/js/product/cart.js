import { auth, db } from "../core/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.handleAddToCart = async function () {
  const btn = document.getElementById("addToCartBtn");
  if (!btn || btn.disabled) return;

  const user = auth.currentUser;
  if (!user) {
    document.querySelector(".auth-overlay")?.classList.add("active");
    return;
  }

  if (!PRODUCT || !SELECTED.color || !SELECTED.size) {
    alert("Please select color and size");
    return;
  }

  btn.disabled = true;
  const oldText = btn.innerText;
  btn.innerText = "ADDING...";

  try {
    const uid = user.uid;

    // 🔑 productId-based cart key
    const docId = `${PRODUCT.productId}_${SELECTED.color}_${SELECTED.size}`;

    const cartRef = doc(db, "users", uid, "cart", docId);
    const snap = await getDoc(cartRef);

    let finalQty = QTY;
    if (snap.exists()) {
      finalQty = snap.data().qty + QTY;
    }

    await setDoc(cartRef, {
      productId: PRODUCT.productId,   // ✅ FIXED
      title: PRODUCT.title,
      color: SELECTED.color,
      size: SELECTED.size,
      qty: finalQty,
      image: PRODUCT.image,
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
