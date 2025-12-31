/* ======================================================
   CHECKOUT.JS — DELIVERY + TOTAL CALCULATION (FINAL)
====================================================== */
import {
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "../core/firebase.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ELEMENTS ================= */
const addressGrid = document.getElementById("addressGrid");
const addressCount = document.getElementById("addressCount");

const orderItemsBox = document.getElementById("orderItems");
const itemCountEl = document.getElementById("itemCount");

const subtotalEl = document.getElementById("checkoutSubtotal");
const totalEl = document.getElementById("checkoutTotal");

const deliveryEl = document.getElementById("deliveryCharge");
const deliverySideEl = document.getElementById("deliveryChargeSide");

/* ================= STATE ================= */
let CURRENT_UID = null;
let SELECTED_ADDRESS = null;
let CHECKOUT_ITEMS = [];
let DELIVERY_CHARGE = 0;
let DELIVERY_CONFIG = null;

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  CURRENT_UID = user.uid;

  await loadDeliveryConfig();
  await loadAddresses(user.uid);
  await loadCheckoutItems(user.uid);
});

/* ======================================================
   LOAD DELIVERY JSON
====================================================== */

async function loadDeliveryConfig() {
  const res = await fetch("./assets/json/delivery_charge.json");
  DELIVERY_CONFIG = await res.json();
}

/* ======================================================
   ADDRESS LOGIC
====================================================== */

async function loadAddresses(uid) {
  addressGrid.innerHTML = "";

  const ref = collection(db, "users", uid, "addresses");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  addressCount.innerText = `(${snap.size}/5)`;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const card = createAddressCard(docSnap.id, data);

    // default address auto select
    if (data.isDefault && !SELECTED_ADDRESS) {
      SELECTED_ADDRESS = data;
      card.classList.add("selected");
      calculateDeliveryCharge(data);
    }

    addressGrid.appendChild(card);
  });
}

function createAddressCard(id, data) {
  const div = document.createElement("div");
  div.className = "address-card";
  div.dataset.id = id;

  div.innerHTML = `
    <div class="address-radio"></div>
    <h4 class="address-name">${data.name}</h4>
    <p class="address-phone">📞 ${data.phone}</p>
    <p class="address-text">
      ${data.street}, ${data.thana}<br>
      ${data.district}
    </p>
  `;

  div.addEventListener("click", () => {
    document
      .querySelectorAll(".address-card")
      .forEach(c => c.classList.remove("selected"));

    div.classList.add("selected");
    SELECTED_ADDRESS = data;
    calculateDeliveryCharge(data);
  });

  return div;
}

/* ======================================================
   DELIVERY CHARGE CALCULATION
====================================================== */

function calculateDeliveryCharge(address) {
  if (!DELIVERY_CONFIG) return;

  DELIVERY_CHARGE =
    DELIVERY_CONFIG.districts[address.district] ??
    DELIVERY_CONFIG.default.charge;

  deliveryEl.innerText = DELIVERY_CHARGE;
  deliverySideEl.innerText = DELIVERY_CHARGE;

  updateTotals();
}

/* ======================================================
   LOAD CHECKOUT ITEMS
====================================================== */

async function loadCheckoutItems(uid) {
  const sid = new URLSearchParams(window.location.search).get("sid");
  if (!sid) return;

  const ref = doc(db, "users", uid, "checkout_sessions", sid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  CHECKOUT_ITEMS = snap.data().items || [];
  renderOrderItems();
  updateTotals();
}

/* ======================================================
   RENDER ITEMS
====================================================== */

function renderOrderItems() {
  orderItemsBox.innerHTML = "";

  let totalQty = 0;

  CHECKOUT_ITEMS.forEach(item => {
    const row = document.createElement("div");
    row.className = "checkout-item";

    const itemTotal = item.price * item.qty;
    totalQty += item.qty;

    row.innerHTML = `
      <div class="ci-left">
        <img src="${item.image}" alt="">
        <div>
          <h4>${item.title}</h4>
          <p>${item.color} | ${item.size}</p>
        </div>
      </div>
      <div>৳ ${item.price}</div>
      <div>${item.qty}</div>
      <div>৳ ${itemTotal}</div>
    `;

    orderItemsBox.appendChild(row);
  });

  itemCountEl.innerText = totalQty;
}

/* ======================================================
   TOTAL CALCULATION
====================================================== */

function updateTotals() {
  const subtotal = CHECKOUT_ITEMS.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  subtotalEl.innerText = `৳ ${subtotal}`;
  totalEl.innerText = `৳ ${subtotal + DELIVERY_CHARGE}`;
}
/* ======================================================
   PLACE ORDER LOGIC (FINAL)
====================================================== */

const confirmBtn = document.getElementById("confirmOrderBtn");
const agreeCheckbox = document.getElementById("agreeTerms");


// initial state
if (confirmBtn) confirmBtn.disabled = true;

if (agreeCheckbox && confirmBtn) {
  agreeCheckbox.addEventListener("change", () => {
    confirmBtn.disabled = !agreeCheckbox.checked;
  });
}









if (confirmBtn) {
  confirmBtn.onclick = async () => {
    if (!agreeCheckbox || !agreeCheckbox.checked) return;
confirmBtn.disabled = true;

    if (!CURRENT_UID) {
      alert("Please login first");
      confirmBtn.disabled = false;
      return;
    }

    if (!SELECTED_ADDRESS) {
      alert("Please select a delivery address");
      confirmBtn.disabled = false;
      return;
    }

    if (CHECKOUT_ITEMS.length === 0) {
      alert("No items to place order");
      confirmBtn.disabled = false;
      return;
    }

    try {
      // -----------------------------
      // CALCULATE TOTALS
      // -----------------------------
      // -----------------------------
      // CALCULATE TOTALS (FIXED)
      // -----------------------------
      const totalItems = CHECKOUT_ITEMS.length; // কয়টা আলাদা product

      const totalQty = CHECKOUT_ITEMS.reduce(
        (sum, i) => sum + i.qty,
        0
      );

      const subtotal = CHECKOUT_ITEMS.reduce(
        (sum, i) => sum + i.price * i.qty,
        0
      );

      const grandTotal = subtotal + DELIVERY_CHARGE;


      // -----------------------------
      // CREATE ORDER (Firestore)
      // -----------------------------
      await addDoc(
        collection(db, "users", CURRENT_UID, "orders"),
        {
          address: {
            ...SELECTED_ADDRESS
          },

          items: CHECKOUT_ITEMS,

          totals: {
            totalItems,
            totalQty,
            subtotal,
            deliveryCharge: DELIVERY_CHARGE,
            grandTotal
          },

          status: "pending",
          createdAt: serverTimestamp()
        }
      );

      // -----------------------------
      // CLEAR ORDERED ITEMS FROM CART
      // -----------------------------
      const cartRef = collection(db, "users", CURRENT_UID, "cart");
      const cartSnap = await getDocs(cartRef);

      for (let docSnap of cartSnap.docs) {
        const cartItem = docSnap.data();

        const matched = CHECKOUT_ITEMS.find(
          i =>
            i.productId === cartItem.productId &&
            i.color === cartItem.color &&
            i.size === cartItem.size
        );

        if (matched) {
          await deleteDoc(
            doc(db, "users", CURRENT_UID, "cart", docSnap.id)
          );
        }
      }


try {
  const sid = new URLSearchParams(location.search).get("sid");
  if (sid) {
    await deleteDoc(
      doc(db, "users", CURRENT_UID, "checkout_sessions", sid)
    );
  }
} catch (e) {
  console.warn("Checkout session cleanup failed:", e);
}


      
      showOrderSuccessModal();

      // বা orders.html
     

    } catch (err) {
      confirmBtn.disabled = false; 
      console.error("Order place failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };
}
 function showOrderSuccessModal() {
        const modal = document.getElementById("orderSuccessModal");
        const okBtn = document.getElementById("successOkBtn");

        if (!modal || !okBtn) return;

        modal.classList.add("active");

        okBtn.onclick = () => {
          modal.classList.remove("active");
          window.location.href = "profile.html"; // বা orders.html
        };
      }



