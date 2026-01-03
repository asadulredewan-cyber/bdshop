/* ======================================================
   CHECKOUT.JS — CLEAN FINAL VERSION
====================================================== */

import {
  addDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "../core/firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { initAddress } from "../profile/address.js";


/* ================= ELEMENTS ================= */
const addressGrid = document.getElementById("addressGrid");
const addressCount = document.getElementById("addressCount");

const orderItemsBox = document.getElementById("orderItems");
const itemCountEl = document.getElementById("itemCount");

const subtotalEl = document.getElementById("checkoutSubtotal");
const totalEl = document.getElementById("checkoutTotal");

const deliveryEl = document.getElementById("deliveryCharge");
const deliverySideEl = document.getElementById("deliveryChargeSide");

const confirmBtn = document.getElementById("confirmOrderBtn");
const agreeCheckbox = document.getElementById("agreeTerms");

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
initAddress(user.uid); 
  await loadDeliveryConfig();
  await loadAddresses(user.uid);
  await loadCheckoutItems(user.uid);
  updatePlaceOrderState();
});

/* ======================================================
   LOAD DELIVERY CONFIG
====================================================== */
async function loadDeliveryConfig() {
  const res = await fetch("./assets/json/delivery_charge.json");
  DELIVERY_CONFIG = await res.json();
}

/* ======================================================
   ADDRESS LOGIC (FINAL)
====================================================== */
async function loadAddresses(uid) {
  addressGrid.innerHTML = "";
  SELECTED_ADDRESS = null;

  const ref = collection(db, "users", uid, "addresses");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  addressCount.innerText = `(${snap.size}/5)`;

  /* ---- NO ADDRESS ---- */
  if (snap.empty) {
    addressGrid.innerHTML = `
      <div style="padding:16px;color:#888;font-size:14px;">
        No delivery address found. Please add an address to place order.
      </div>
    `;
    disablePlaceOrder();
    return;
  }

  /* ---- ADDRESS EXISTS ---- */
  let defaultUsed = false;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    const card = createAddressCard(docSnap.id, data);

    if (data.isDefault && !defaultUsed) {
      defaultUsed = true;
      SELECTED_ADDRESS = data;
      card.classList.add("selected");
      calculateDeliveryCharge(data);
    }

    addressGrid.appendChild(card);
  });

  /* ---- fallback: first address ---- */
  if (!SELECTED_ADDRESS) {
    const firstCard = addressGrid.querySelector(".address-card");
    if (firstCard) {
      firstCard.classList.add("selected");
      const firstId = firstCard.dataset.id;
      const firstDoc = snap.docs.find(d => d.id === firstId);
      if (firstDoc) {
        SELECTED_ADDRESS = firstDoc.data();
        calculateDeliveryCharge(SELECTED_ADDRESS);
      }
    }
  }

  updatePlaceOrderState();
}

function createAddressCard(id, data) {
  const div = document.createElement("div");
  div.className = "address-card";
  div.dataset.id = id;

  div.innerHTML = `
    <div class="address-radio"></div>
    <h4>${data.name}</h4>
    <p>📞 ${data.phone}</p>
    <p>${data.street}, ${data.thana}<br>${data.district}</p>
  `;

  div.addEventListener("click", () => {
    document
      .querySelectorAll(".address-card")
      .forEach(c => c.classList.remove("selected"));

    div.classList.add("selected");
    SELECTED_ADDRESS = data;
    calculateDeliveryCharge(data);
    updatePlaceOrderState();
  });

  return div;
}

/* ======================================================
   DELIVERY CHARGE
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
  const sid = new URLSearchParams(location.search).get("sid");
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
    totalQty += item.qty;
 orderItemsBox.innerHTML += `
  <div class="checkout-item">
    <img src="${item.image}">

    <div class="ci-info">
      <div class="ci-title">${item.title}</div>
      ${
        item.color || item.size
          ? `<div class="ci-variant">
               ${item.color ?? ""}${item.color && item.size ? " | " : ""}${item.size ?? ""}
             </div>`
          : ""
      }
    </div>

    <div class="ci-meta">
      <div class="ci-price">
        <span>price</span>
        <strong>৳ ${item.price}</strong>
      </div>

      <div class="ci-qty">
        <span>qty</span>
        <strong>${item.qty}</strong>
      </div>
    </div>

    <div class="ci-total">
      <span>Total price</span>
      <strong>৳ ${item.price * item.qty}</strong>
    </div>
  </div>
`;

  });

  itemCountEl.innerText = totalQty;
}

/* ======================================================
   TOTALS
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
   PLACE ORDER STATE
====================================================== */
function updatePlaceOrderState() {
  if (!confirmBtn) return;

  const canPlace =
    agreeCheckbox?.checked &&
    SELECTED_ADDRESS &&
    CHECKOUT_ITEMS.length > 0;

  confirmBtn.disabled = !canPlace;
}

function disablePlaceOrder() {
  if (confirmBtn) confirmBtn.disabled = true;
}

/* ================= AGREE CHECK ================= */
if (agreeCheckbox) {
  agreeCheckbox.addEventListener("change", updatePlaceOrderState);
}

/* ======================================================
   PLACE ORDER
====================================================== */
if (confirmBtn) {
  confirmBtn.onclick = async () => {
    if (!agreeCheckbox.checked || !SELECTED_ADDRESS) return;

    confirmBtn.disabled = true;

    try {
      const subtotal = CHECKOUT_ITEMS.reduce(
        (s, i) => s + i.price * i.qty,
        0
      );

      await addDoc(
        collection(db, "users", CURRENT_UID, "orders"),
        {
          address: { ...SELECTED_ADDRESS },
          items: CHECKOUT_ITEMS,
          totals: {
            subtotal,
            deliveryCharge: DELIVERY_CHARGE,
            grandTotal: subtotal + DELIVERY_CHARGE
          },
          status: "pending",
          createdAt: serverTimestamp()
        }
      );

      // clear cart items
      const cartSnap = await getDocs(
        collection(db, "users", CURRENT_UID, "cart")
      );

      for (let d of cartSnap.docs) {
        const c = d.data();
        if (CHECKOUT_ITEMS.find(i =>
          i.productId === c.productId &&
          i.color === c.color &&
          i.size === c.size
        )) {
          await deleteDoc(doc(db, "users", CURRENT_UID, "cart", d.id));
        }
      }

      // remove checkout session
      const sid = new URLSearchParams(location.search).get("sid");
      if (sid) {
        await deleteDoc(
          doc(db, "users", CURRENT_UID, "checkout_sessions", sid)
        );
      }

      showOrderSuccessModal();

    } catch (e) {
      console.error(e);
      confirmBtn.disabled = false;
      alert("Order failed. Try again.");
    }
  };
}

/* ======================================================
   SUCCESS MODAL
====================================================== */
function showOrderSuccessModal() {
  const modal = document.getElementById("orderSuccessModal");
  const okBtn = document.getElementById("successOkBtn");
  if (!modal || !okBtn) return;

  modal.classList.add("active");
  okBtn.onclick = () => location.href = "profile.html";
}
