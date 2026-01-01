import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../core/firebase.js";

/* ================= GLOBAL ================= */
let CURRENT_UID = null;
let BD_DATA = {};
let EDIT_ID = null;

/* ================= ELEMENTS ================= */
const contactName  = document.getElementById("contactName");
const mobileNumber = document.getElementById("mobileNumber");

const addressModal  = document.getElementById("addressModal");
const addAddressBtn = document.getElementById("addAddressBtn");
const cancelAddress = document.getElementById("cancelAddress");
const saveAddress   = document.getElementById("saveAddress");

const addrDistrict = document.getElementById("addrDistrict");
const addrThana    = document.getElementById("addrThana");
const addrStreet   = document.getElementById("addrStreet");
const addrLandmark = document.getElementById("addrLandmark");
const defaultCheckbox = document.getElementById("defaultAddressCheckbox");

const addressList = document.getElementById("addressList");

/* ================= INIT ================= */
export function initAddress(uid) {
  CURRENT_UID = uid;
  loadDistrictData();
  loadAddresses();
  loadDefaultAddress(); // 🔥 important
}


/* ================= MODAL ================= */
addAddressBtn?.addEventListener("click", () => {
  EDIT_ID = null;
  resetForm();
  addressModal.classList.add("active");
});

cancelAddress?.addEventListener("click", () => {
  addressModal.classList.remove("active");
});

/* ================= DISTRICT / THANA ================= */
async function loadDistrictData() {
  const res = await fetch("./assets/json/bd_locations.json");
  BD_DATA = await res.json();

  addrDistrict.innerHTML = `<option value="">Select District</option>`;
  addrThana.innerHTML = `<option value="">Select Thana / Upazila</option>`;
  addrThana.disabled = true;

  Object.keys(BD_DATA).forEach(d => {
    addrDistrict.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

addrDistrict.addEventListener("change", () => {
  const d = addrDistrict.value;

  addrThana.innerHTML = `<option value="">Select Thana / Upazila</option>`;
  addrThana.disabled = !d;

  if (!d) return;

  BD_DATA[d].forEach(t => {
    addrThana.innerHTML += `<option value="${t}">${t}</option>`;
  });
});

/* ================= SAVE / UPDATE ================= */
saveAddress.addEventListener("click", async () => {

  if (
    !contactName.value.trim() ||
    !mobileNumber.value.trim() ||
    !addrStreet.value.trim() ||
    !addrDistrict.value ||
    !addrThana.value
  ) {
    alert("Name, Phone, Street, District & Thana required");
    return;
  }

  /* UI loading state */
  const originalText = saveAddress.innerText;
  saveAddress.innerText = "Saving...";
  saveAddress.disabled = true;

  try {
    const ref = collection(db, "users", CURRENT_UID, "addresses");

    /* ensure only one default */
    if (defaultCheckbox.checked) {
      const snap = await getDocs(ref);
      for (const d of snap.docs) {
        if (d.data().isDefault === true) {
          await updateDoc(doc(ref, d.id), { isDefault: false });
        }
      }
    }

    const snap = await getDocs(ref);
    const autoDefault = snap.empty;

    const payload = {
      name: contactName.value.trim(),
      phone: mobileNumber.value.trim(),
      street: addrStreet.value.trim(),
      landmark: addrLandmark.value.trim(),
      district: addrDistrict.value,
      thana: addrThana.value,
      isDefault: autoDefault || defaultCheckbox.checked
    };

    if (EDIT_ID) {
      await updateDoc(doc(ref, EDIT_ID), payload);
    } else {
      await addDoc(ref, {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    addressModal.classList.remove("active");
    resetForm();
    loadAddresses();

  } catch (err) {
    console.error("Address save failed:", err);
    alert("Something went wrong. Try again.");
  }

  saveAddress.innerText = originalText;
  saveAddress.disabled = false;
});

/* ================= LOAD ADDRESS LIST ================= */
async function loadAddresses() {
  addressList.innerHTML = "";

  const q = query(
    collection(db, "users", CURRENT_UID, "addresses"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(d => {
    const a = d.data();

    addressList.innerHTML += `
      <div class="address-card ${a.isDefault ? "default" : ""}">

        <div class="address-top">
          <span class="address-label">
            ${a.isDefault ? "Default Address" : "Saved Address"}
          </span>
        </div>

        <div class="address-body">
          <div class="address-person">
            <strong class="person-name">${a.name}</strong>
            <span class="person-phone">${a.phone}</span>
          </div>

          <p class="address-line">
            ${a.street}${a.landmark ? `, ${a.landmark}` : ""}
          </p>

          <p class="address-sub">
            ${a.thana}, ${a.district}
          </p>
        </div>

        <div class="address-actions">
          <button class="btn-edit" onclick="editAddress('${d.id}')">
            <i class="fa-regular fa-pen-to-square"></i> Edit
          </button>
          <button class="btn-delete" onclick="deleteAddress('${d.id}')">
            <i class="fa-regular fa-trash-can"></i> Delete
          </button>
        </div>

      </div>
    `;
  });
}

/* ================= EDIT ================= */
window.editAddress = async (id) => {
  EDIT_ID = id;

  const ref = doc(db, "users", CURRENT_UID, "addresses", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const a = snap.data();

  contactName.value  = a.name || "";
  mobileNumber.value = a.phone || "";
  addrStreet.value   = a.street || "";
  addrLandmark.value = a.landmark || "";
  addrDistrict.value = a.district || "";

  addrDistrict.dispatchEvent(new Event("change"));

  setTimeout(() => {
    addrThana.value = a.thana || "";
  }, 0);

  defaultCheckbox.checked = !!a.isDefault;

  addressModal.classList.add("active");
};

/* ================= DELETE ================= */
window.deleteAddress = async (id) => {
  if (!confirm("Delete this address?")) return;

  await deleteDoc(
    doc(db, "users", CURRENT_UID, "addresses", id)
  );

  loadAddresses();
};

/* ================= RESET ================= */
function resetForm() {
  contactName.value = "";
  mobileNumber.value = "";
  addrStreet.value = "";
  addrLandmark.value = "";
  addrDistrict.value = "";
  addrThana.innerHTML = `<option value="">Select Thana / Upazila</option>`;
  addrThana.disabled = true;
  defaultCheckbox.checked = false;
}
const defaultAddressBox = document.getElementById("defaultAddressBox");
const editDefaultBtn = document.getElementById("editDefaultAddress");

let DEFAULT_ADDRESS_ID = null;

async function loadDefaultAddress() {
  if (!defaultAddressBox) return;

  const q = query(
    collection(db, "users", CURRENT_UID, "addresses"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  let found = false;

  snap.forEach(d => {
    const a = d.data();
    if (a.isDefault && !found) {
      found = true;
      DEFAULT_ADDRESS_ID = d.id;

      defaultAddressBox.innerHTML = `
        <strong>${a.name}</strong><br>
        ${a.phone}<br>
        ${a.street}${a.landmark ? `, ${a.landmark}` : ""}<br>
        ${a.thana}, ${a.district}
      `;
    }
  });

  if (!found) {
    defaultAddressBox.innerHTML =
      `<p class="muted-text">Please Add Your Shipping Address</p>`;
  }
}
editDefaultBtn?.addEventListener("click", async () => {
  if (!DEFAULT_ADDRESS_ID) {
    // যদি default না থাকে → Add modal open
    EDIT_ID = null;
    resetForm();
    addressModal.classList.add("active");
    return;
  }

  // default address edit
  EDIT_ID = DEFAULT_ADDRESS_ID;

  const ref = doc(db, "users", CURRENT_UID, "addresses", DEFAULT_ADDRESS_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const a = snap.data();

  contactName.value = a.name || "";
  mobileNumber.value = a.phone || "";
  addrStreet.value = a.street;
  addrLandmark.value = a.landmark || "";
  addrDistrict.value = a.district;

  addrDistrict.dispatchEvent(new Event("change"));
  setTimeout(() => {
    addrThana.value = a.thana;
  }, 0);

  defaultCheckbox.checked = true;

  addressModal.classList.add("active");
});
