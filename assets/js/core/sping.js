/* =====================================================
   GLOBAL PAGE LOADER (Firebase-aware)
   File: assets/js/core/sping.js
===================================================== */

let PENDING_LOADS = 0;
let loaderEl = null;

/* ---------- internal helpers ---------- */
function lockPage() {
  document.body.classList.add("page-loading");
}

function unlockPage() {
  document.body.classList.remove("page-loading");
}

/* ---------- public API ---------- */
window.startPageLoad = function () {
  PENDING_LOADS++;
  if (loaderEl) {
    loaderEl.classList.remove("hidden");
    lockPage();
  }
};

window.endPageLoad = function () {
  PENDING_LOADS--;
  if (PENDING_LOADS <= 0) {
    PENDING_LOADS = 0;
    if (loaderEl) {
      loaderEl.classList.add("hidden");
      unlockPage();
    }
  }
};

/* ---------- init on DOM ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loaderEl = document.getElementById("pageLoader");

  if (!loaderEl) {
    console.warn("pageLoader element not found");
    return;
  }

  // page start → show loader immediately
  lockPage();
  loaderEl.classList.remove("hidden");
});

/* =====================================================
   Firebase integration guideline
   (this file does NOT import firebase itself)
===================================================== */

/*
HOW TO USE (IMPORTANT):

1️⃣ Page load start:
   startPageLoad();

2️⃣ Each async Firebase task:
   startPageLoad();
   someAsyncFn().finally(endPageLoad);

3️⃣ Final hide happens automatically
   when all pending loads finish
*/
