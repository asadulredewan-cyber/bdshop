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
    document.querySelector(".auth-overlay")?.classList.add("active");
    return;
  }

  const colorData = PRODUCT.colorVariants?.[SELECTED.color] || {};
  const sizeData = colorData.sizes?.[SELECTED.size] || {};

  const price =
    sizeData.price ??
    PRODUCT.price ??
    PRODUCT.basePrice ??
    0;

  const checkoutItem = {
    productId: PRODUCT.productId,   // ✅ FIXED
    title: PRODUCT.title,
    color: SELECTED.color,
    size: SELECTED.size,
    qty: QTY,
    price,
    image: colorData.image || PRODUCT.image
  };

  const ref = await addDoc(
    collection(db, "users", user.uid, "checkout_sessions"),
    {
      items: [checkoutItem],
      source: "buy_now",
      createdAt: serverTimestamp()
    }
  );

  window.location.href = `./checkout.html?sid=${ref.id}`;
});
