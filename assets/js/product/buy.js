import {
  addDoc,
  serverTimestamp,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "../core/firebase.js";

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("buy-now")) return;

  const user = auth.currentUser;
  if (!user) {
    // login modal open
    document.querySelector(".auth-overlay")?.classList.add("active");
    return;
  }

  // 🔹 exact same structure as cart checkout
  const colorData = PRODUCT.colorVariants?.[SELECTED.color] || {};
  const sizeData = colorData.sizes?.[SELECTED.size] || {};

  const price =
    sizeData.price ??
    PRODUCT.price ??
    PRODUCT.basePrice ??
    0;

  const checkoutItem = {
    productId: PRODUCT.id,
    title: PRODUCT.title,
    color: SELECTED.color,
    size: SELECTED.size,
    qty: QTY,
    price: price,
    image: colorData.image || PRODUCT.image
  };

  // 🔹 create checkout session
  const ref = await addDoc(
    collection(db, "users", user.uid, "checkout_sessions"),
    {
      items: [checkoutItem],   // 🔥 only this product
      source: "buy_now",        // optional but recommended
      createdAt: serverTimestamp()
    }
  );

  // 🔹 redirect
  window.location.href = `checkout.html?sid=${ref.id}`;
});
