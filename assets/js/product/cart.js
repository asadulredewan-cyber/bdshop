import { auth, db } from "../core/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


function hasColors(product) {
  return product.colorVariants && Object.keys(product.colorVariants).length > 0;
}

function hasSizes(product, color) {
  if (!color) return false;
  return (
    product.colorVariants?.[color]?.sizes &&
    Object.keys(product.colorVariants[color].sizes).length > 0
  );
}


window.handleAddToCart = async function () {
  const btn = document.getElementById("addToCartBtn");
  if (!btn || btn.disabled) return;

  const user = auth.currentUser;
  if (!user) {
    document.querySelector(".auth-overlay")?.classList.add("active");
    return;
  }

  if (!PRODUCT) return;

if (hasColors(PRODUCT) && !SELECTED.color) {
  alert("Please select a color");
  return;
}

if (hasSizes(PRODUCT, SELECTED.color) && !SELECTED.size) {
  alert("Please select a size");
  return;
}

  btn.disabled = true;
  const oldText = btn.innerText;
  btn.innerText = "ADDING...";

  try {
    const uid = user.uid;

    // 🔑 productId-based cart key
    const colorKey = SELECTED.color || "default";
const sizeKey = SELECTED.size || "default";

const docId = `${PRODUCT.productId}_${colorKey}_${sizeKey}`;

    const cartRef = doc(db, "users", uid, "cart", docId);
    const snap = await getDoc(cartRef);

    let finalQty = QTY;
    if (snap.exists()) {
      finalQty = snap.data().qty + QTY;
    }

    await setDoc(cartRef, {
  productId: PRODUCT.productId,
  title: PRODUCT.title,
  color: hasColors(PRODUCT) ? SELECTED.color : null,
  size: hasSizes(PRODUCT, SELECTED.color) ? SELECTED.size : null,
  qty: finalQty,
  image: CURRENT_IMAGE || PRODUCT.image,
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


