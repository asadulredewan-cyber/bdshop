import { auth, db } from "../core/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= ELEMENTS ================= */
const ordersBody = document.getElementById("ordersBody");
const ordersSection = document.getElementById("ordersSection");

/* ================= STATE ================= */
let CURRENT_UID = null;
let CURRENT_FILTER = "all";

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  CURRENT_UID = user.uid;
  loadOrders();
});

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  ordersBody.innerHTML = "";

  const q = query(
    collection(db, "users", CURRENT_UID, "orders"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    ordersBody.innerHTML = `<p style="padding:16px">No orders</p>`;
    return;
  }

  snap.forEach(docSnap => {
    const order = docSnap.data();

    if (CURRENT_FILTER === "cancelled" && order.status !== "cancelled") return;
    if (CURRENT_FILTER === "returned" && order.status !== "returned") return;
    if (CURRENT_FILTER === "completed" && order.status !== "delivered") return;

    ordersBody.appendChild(
      createOrderRow(docSnap.id, order)
    );
  });
}

/* ================= CREATE ROW ================= */
function createOrderRow(orderId, order) {
  const row = document.createElement("div");
  row.className = "orders-row";

  const shortId = "#" + orderId.slice(0, 7).toUpperCase();

  const date = order.createdAt
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-GB")
    : "-";

  /* Item clickable */
  const itemsHTML = order.items.map(i => `
    <a href="./product.html?pid=${i.productId}"
       class="order-item-box order-item-link">
      ${i.title}
    </a>
  `).join("");

  const qtyHTML = `
    <div class="qty-box">
      ${order.items.map(i => `<span>${i.qty}</span>`).join("")}
    </div>
  `;

  const colorSizeHTML = `
    <div class="color-size-box">
      ${order.items.map(i =>
    `<span>${i.color || "-"} / ${i.size || "-"}</span>`
  ).join("")}
    </div>
  `;

  const amount = order.totals?.grandTotal ?? 0;
  const status = order.status || "pending";

  /* ================= ACTION LOGIC ================= */
  let actionHTML = "—";

  /* Cancel allowed */
  if (status === "pending" || status === "confirm") {
    actionHTML = `<button class="cancel-btn">Cancel</button>`;
  }

  /* Return logic */
  if (status === "delivered") {
    const deliveredAt = order.deliveredAt?.seconds
      ? new Date(order.deliveredAt.seconds * 1000)
      : null;

    let disableReturn = true;

    if (deliveredAt) {
      const diffDays =
        (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
      disableReturn = diffDays > 7;
    }

    actionHTML = `
      <button class="return-btn ${disableReturn ? "disabled" : ""}">
        Return
      </button>
    `;
  }

  row.innerHTML = `
    <span>${shortId}</span>
    <span>${date}</span>
    <span>${itemsHTML}</span>
    <span>${qtyHTML}</span>
    <span>৳ ${amount}</span>
    <span>${colorSizeHTML}</span>
    <span class="status ${status}">${status}</span>
    <span>${actionHTML}</span>
  `;

  /* Cancel click */
  const cancelBtn = row.querySelector(".cancel-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => cancelOrder(orderId);
  }

  /* Return click */
  const returnBtn = row.querySelector(".return-btn:not(.disabled)");
  if (returnBtn) {
    returnBtn.onclick = () => returnOrder(orderId);
  }

  return row;
}

/* ================= CANCEL ORDER ================= */
async function cancelOrder(orderId) {
  if (!confirm("Cancel this order?")) return;

  await updateDoc(
    doc(db, "users", CURRENT_UID, "orders", orderId),
    { status: "cancelled" }
  );

  // 🔥 IMPORTANT: reset filter so status is visible
  CURRENT_FILTER = "all";

  loadOrders();
}


/* ================= RETURN ORDER ================= */
async function returnOrder(orderId) {
  if (!confirm("Request return for this order?")) return;

  await updateDoc(
    doc(db, "users", CURRENT_UID, "orders", orderId),
    { status: "returned" }
  );

  loadOrders();
}






/* ================= SIDEBAR FILTER ================= */
document.querySelectorAll(".account-menu li").forEach(li => {
  li.addEventListener("click", () => {
    const t = li.innerText.toLowerCase();

    if (t.includes("orders")) CURRENT_FILTER = "all";
if (t.includes("complate")) CURRENT_FILTER = "completed";
if (t.includes("cancellation")) CURRENT_FILTER = "cancelled";
if (t.includes("returns")) CURRENT_FILTER = "returned";

    ordersSection.style.display = "block";
    loadOrders();
  });
});
