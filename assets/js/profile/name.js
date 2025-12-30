/* =====================================================
   PROFILE PAGE — FULL JS (NO ADDRESS)
===================================================== */

import { auth, db } from "../core/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initAddress } from "./address.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  CURRENT_UID = user.uid;

  initAddress(user.uid); // 🔥 এই লাইনটাই missing ছিল
});

/* ================= GLOBAL ================= */
let CURRENT_UID = null;
let PROFILE_CACHE = null;

/* ================= ELEMENTS ================= */
const sidebar = document.querySelector(".account-sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const menuItems = document.querySelectorAll(".account-menu li");

const sidebarName = document.getElementById("sidebarFullName");
const profileName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");

/* ===== PROFILE EDIT MODAL ===== */
const profileModal = document.getElementById("profileEditModal");
const editProfileBtn = document.getElementById("editProfileBtn");

const editFirstName = document.getElementById("editFirstName");
const editLastName = document.getElementById("editLastName");
const editEmail = document.getElementById("editEmail");
const editMobile = document.getElementById("editMobile");

const saveProfileEdit = document.getElementById("saveProfileEdit");
const cancelProfileEdit = document.getElementById("cancelProfileEdit");

/* ===== LOGOUT MODAL ===== */
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");
const trackOrdersSection = document.getElementById("trackOrdersSection");


/* ================= HELPERS ================= */
function fillText(el, value) {
  if (!el) return;
  el.innerText = value;
}

/* ================= AUTH LOAD ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  CURRENT_UID = user.uid;

  const ref = doc(db, "users", user.uid, "profile", "data");
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  PROFILE_CACHE = snap.data();

  const fullName =
    `${PROFILE_CACHE.firstName || ""} ${PROFILE_CACHE.lastName || ""}`.trim();

  fillText(sidebarName, fullName || "User");
  fillText(profileName, fullName || "—");
  fillText(profileEmail, PROFILE_CACHE.email || "—");
});

/* ================= MOBILE DRAWER ================= */
sidebarToggle?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

menuItems.forEach(item => {
  item.addEventListener("click", () => {

    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    if (item.innerText.includes("Address")) {
      // Address Book page
      mainPage.style.display = "none";
      addressPage.style.display = "block";
      trackOrdersSection.style.display = "none"; // 🔥 hide
    } else {
      // Manage My Account
      mainPage.style.display = "grid";
      addressPage.style.display = "none";
      trackOrdersSection.style.display = "block"; // 🔥 show
    }

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
    }
  });
});


/* swipe to close */
let startX = 0;
sidebar.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});
sidebar.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].clientX - startX;
  if (diff < -60) sidebar.classList.remove("active");
});

/* ================= PROFILE EDIT ================= */
editProfileBtn.onclick = () => {
  if (!PROFILE_CACHE) return;

  editFirstName.value = PROFILE_CACHE.firstName || "";
  editLastName.value  = PROFILE_CACHE.lastName || "";
  editEmail.value     = PROFILE_CACHE.email || "";
  editMobile.value    = PROFILE_CACHE.mobile || "";

  profileModal.classList.add("active");
};

cancelProfileEdit.onclick = () => {
  profileModal.classList.remove("active");
};

saveProfileEdit.onclick = async () => {
  const firstName = editFirstName.value.trim();
  const lastName  = editLastName.value.trim();

  if (!firstName || !lastName) {
    alert("First name and last name required");
    return;
  }

  await updateDoc(
    doc(db, "users", CURRENT_UID, "profile", "data"),
    { firstName, lastName }
  );

  profileModal.classList.remove("active");
  location.reload();
};

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => {
  logoutModal.classList.add("active");
};

cancelLogout.onclick = () => {
  logoutModal.classList.remove("active");
};

confirmLogout.onclick = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
/* ================= CLICK OUTSIDE TO CLOSE ================= */
[profileModal, logoutModal].forEach(modal => {
  modal.addEventListener("click", (e) => {
    // only close if clicking the overlay, not the modal card
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});
/* ================= SIDEBAR CLOSE ICON ================= */
const sidebarClose = document.getElementById("sidebarClose");

sidebarClose?.addEventListener("click", () => {
  sidebar.classList.remove("active");
  document.body.classList.remove("drawer-open");
});





menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    // mobile হলে sidebar auto close
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
    }
  });
});


const addressPage = document.getElementById("addressPage");
const mainPage = document.querySelector(".profile-grid");

menuItems.forEach(item => {
  item.addEventListener("click", () => {

    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    if (item.innerText.includes("Address")) {
      mainPage.style.display = "none";
      addressPage.style.display = "block";
    } else {
      mainPage.style.display = "grid";
      addressPage.style.display = "none";
    }

    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
    }
  });
});

