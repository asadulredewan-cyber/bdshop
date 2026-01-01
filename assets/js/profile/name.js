/* =====================================================
    PROFILE PAGE — FULL OPTIMIZED JS
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

/* ================= GLOBAL VARIABLES ================= */
let CURRENT_UID = null;
let PROFILE_CACHE = null;

/* ================= DOM ELEMENTS ================= */
// প্রধান ৩টি সেকশন (আপনার HTML ID অনুযায়ী)
const mainPage = document.querySelector(".profile-grid");        // Personal Profile Info
const addressPage = document.getElementById("addressPage");      // Address Book Section
const trackOrdersSection = document.getElementById("ordersSection"); // আপনার দেওয়া ID: ordersSection

// নেভিগেশন ও সাইডবার
const sidebar = document.querySelector(".account-sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarClose = document.getElementById("sidebarClose");
const menuItems = document.querySelectorAll(".account-menu li");

// প্রোফাইল ডাটা ডিসপ্লে
const sidebarName = document.getElementById("sidebarFullName");
const profileName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");

// মোডাল এলিমেন্টস
const profileModal = document.getElementById("profileEditModal");
const logoutModal = document.getElementById("logoutModal");

/* ================= HELPERS ================= */
// সেকশন হাইড/শো করার নিরাপদ ফাংশন
const showSection = (el, displayType = "block") => {
  if (el) el.style.display = displayType;
};
const hideSection = (el) => {
  if (el) el.style.display = "none";
};

/* ================= AUTH LOAD ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }
  
  CURRENT_UID = user.uid;
  initAddress(user.uid);

  const ref = doc(db, "users", user.uid, "profile", "data");
  const snap = await getDoc(ref);
  
  if (snap.exists()) {
    PROFILE_CACHE = snap.data();
    const fullName = `${PROFILE_CACHE.firstName || ""} ${PROFILE_CACHE.lastName || ""}`.trim();
    
    if (sidebarName) sidebarName.innerText = fullName || "User";
    if (profileName) profileName.innerText = fullName || "—";
    if (profileEmail) profileEmail.innerText = PROFILE_CACHE.email || "—";
  }
});

/* ================= NAVIGATION LOGIC ================= */
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    // অ্যাক্টিভ ক্লাস আপডেট
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const menuText = item.innerText.trim();

    // ১. Manage My Account: শুধুমাত্র প্রোফাইল কার্ড দেখাবে (অ্যাড্রেস ও অর্ডার হাইড)
    if (menuText.includes("Manage My Account")) {
      showSection(mainPage, "grid");
      hideSection(addressPage);
      hideSection(trackOrdersSection);
    } 
    // ২. Address Book: শুধুমাত্র অ্যাড্রেস পেজ দেখাবে
    else if (menuText.includes("Address Book")) {
      hideSection(mainPage);
      showSection(addressPage);
      hideSection(trackOrdersSection);
    } 
    // ৩. Order সংক্রান্ত মেনুসমূহ: শুধুমাত্র অর্ডার সেকশন দেখাবে
    else if (
      menuText.includes("My Orders") || 
      menuText.includes("My Returns") || 
      menuText.includes("My Cancellation") ||
      menuText.includes("My Complete")
    ) {
      hideSection(mainPage);
      hideSection(addressPage);
      showSection(trackOrdersSection);
    }

    // মোবাইল সাইডবার অটো ক্লোজ
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove("active");
    }
  });
});

/* ================= SIDEBAR UI ================= */
sidebarToggle?.addEventListener("click", () => sidebar?.classList.add("active"));
sidebarClose?.addEventListener("click", () => sidebar?.classList.remove("active"));

/* ================= PROFILE EDIT ================= */
document.getElementById("editProfileBtn")?.addEventListener("click", () => {
  if (!PROFILE_CACHE) return;
  const fName = document.getElementById("editFirstName");
  const lName = document.getElementById("editLastName");
  const email = document.getElementById("editEmail");
  const mobile = document.getElementById("editMobile");

  if (fName) fName.value = PROFILE_CACHE.firstName || "";
  if (lName) lName.value = PROFILE_CACHE.lastName || "";
  if (email) email.value = PROFILE_CACHE.email || "";
  if (mobile) mobile.value = PROFILE_CACHE.mobile || "";
  
  profileModal?.classList.add("active");
});

document.getElementById("cancelProfileEdit")?.addEventListener("click", () => {
  profileModal?.classList.remove("active");
});

document.getElementById("saveProfileEdit")?.addEventListener("click", async () => {
  const firstName = document.getElementById("editFirstName")?.value.trim();
  const lastName  = document.getElementById("editLastName")?.value.trim();

  if (!firstName || !lastName) {
    alert("Full name is required");
    return;
  }

  try {
    const userRef = doc(db, "users", CURRENT_UID, "profile", "data");
    await updateDoc(userRef, { firstName, lastName });
    profileModal?.classList.remove("active");
    location.reload();
  } catch (error) {
    console.error("Update error:", error);
  }
});

/* ================= LOGOUT ================= */
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  logoutModal?.classList.add("active");
});

document.getElementById("cancelLogout")?.addEventListener("click", () => {
  logoutModal?.classList.remove("active");
});

document.getElementById("confirmLogout")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./index.html";
});

/* ================= CLOSE MODALS ON OUTSIDE CLICK ================= */
window.addEventListener("click", (e) => {
  if (e.target === profileModal) profileModal.classList.remove("active");
  if (e.target === logoutModal) logoutModal.classList.remove("active");
});