/* ================= AUTH MODAL JS ================= */

const authOverlay = document.querySelector(".auth-overlay");
const openLoginBtn = document.getElementById("openLoginBtn");
const closeBtn = document.querySelector(".auth-close");

const loginBody = document.getElementById("login-body");
const signupBody = document.getElementById("signup-body");

const loginTitle = document.getElementById("login-title");
const signupTitle = document.getElementById("signup-title");

const toSignup = document.getElementById("to-signup");
const toLogin = document.getElementById("to-login");

/* open modal */
window.openLoginModal = function () {
  authOverlay?.classList.add("active");
  showLogin();
};

/* close modal */
function closeModal() {
  authOverlay?.classList.remove("active");
}

closeBtn?.addEventListener("click", closeModal);
authOverlay?.addEventListener("click", (e) => {
  if (e.target === authOverlay) closeModal();
});

/* header button */
openLoginBtn?.addEventListener("click", () => {
  if (window.CURRENT_USER) {
    window.location.href = "profile.html";
  } else {
    openLoginModal();
  }
});

/* switch forms */
function showLogin() {
  loginBody?.classList.add("active");
  loginTitle?.classList.add("active");

  signupBody?.classList.remove("active");
  signupTitle?.classList.remove("active");
}

function showSignup() {
  signupBody?.classList.add("active");
  signupTitle?.classList.add("active");

  loginBody?.classList.remove("active");
  loginTitle?.classList.remove("active");
}

toSignup?.addEventListener("click", showSignup);
toLogin?.addEventListener("click", showLogin);
/* ================= CART BUTTON LOGIC ================= */

const cartAction = document.getElementById("cartAction");

cartAction?.addEventListener("click", () => {
  if (!window.CURRENT_USER) {
    openLoginModal();   // login modal খুলবে
  } else {
    window.location.href = "cart.html"; // cart page
  }
});
