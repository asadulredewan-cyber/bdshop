/* =====================================================
   LOGIN / SIGNUP / GOOGLE / FORGOT
===================================================== */

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= ELEMENTS ================= */

const authOverlay = document.querySelector(".auth-overlay");
const closeBtn = document.querySelector(".auth-close");

const loginBody = document.getElementById("login-body");
const signupBody = document.getElementById("signup-body");

const loginTitle = document.getElementById("login-title");
const signupTitle = document.getElementById("signup-title");

const forgotBox = document.getElementById("forgot-password-box");
const statusBox = document.getElementById("auth-status");
const statusMsg = document.getElementById("status-message");

const toSignup = document.getElementById("to-signup");
const toLogin = document.getElementById("to-login");

/* ================= HELPERS ================= */

function showStatus(msg, isError = false) {
  statusMsg.innerText = msg;
  statusBox.style.display = "flex";
  statusBox.className = isError
    ? "status-container error"
    : "status-container success";

  setTimeout(() => {
    statusBox.style.display = "none";
  }, 4000);
}

function openModal() {
  authOverlay.classList.add("active");
  showLogin();
}

function closeModal() {
  authOverlay.classList.remove("active");
}

closeBtn.onclick = closeModal;
authOverlay.addEventListener("click", e => {
  if (e.target === authOverlay) closeModal();
});

/* ================= FORM SWITCH ================= */

function showLogin() {
  signupBody.classList.remove("active");
  signupTitle.classList.remove("active");

  forgotBox.style.display = "none";
  Array.from(loginBody.children).forEach(el => el.style.display = "");

  loginBody.classList.add("active");
  loginTitle.classList.add("active");
  loginTitle.innerText = "Sign In";
}

function showSignup() {
  loginBody.classList.remove("active");
  loginTitle.classList.remove("active");

  signupBody.classList.add("active");
  signupTitle.classList.add("active");
}

toSignup.onclick = showSignup;
toLogin.onclick = showLogin;

/* ================= FORGOT ================= */

window.handleForgotPassword = () => {
  Array.from(loginBody.children).forEach(el => {
    if (el.id !== "forgot-password-box") el.style.display = "none";
  });
  forgotBox.style.display = "block";
  loginTitle.innerText = "Reset Password";
};

window.hideForgotBox = showLogin;

window.handlePasswordReset = async () => {
  const email = document.getElementById("reset-email").value.trim();
  const btn = forgotBox.querySelector(".btn");

  if (!email) {
    showStatus("⚠ ইমেইল দিন", true);
    return;
  }

  btn.innerText = "Sending...";
  btn.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);
    showStatus("✅ Reset link sent to your email");

    setTimeout(() => {
      btn.innerText = "Send Reset Link";
      btn.disabled = false;
      document.getElementById("reset-email").value = "";
      showLogin();
    }, 3000);

  } catch (err) {
    showStatus("❌ ইমেইল পাওয়া যায়নি", true);
    btn.innerText = "Send Reset Link";
    btn.disabled = false;
  }
};

/* ================= SIGN IN ================= */

window.handleSignIn = async () => {
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-pass").value;
  const btn = document.getElementById("main-login-btn");

  if (!email || !pass) {
    showStatus("⚠ Email & Password required", true);
    return;
  }

  btn.innerText = "Processing...";
  btn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showStatus("✅ Login successful");
    setTimeout(closeModal, 1200);
  } catch (err) {
    showStatus("❌ Wrong email or password", true);
    btn.innerText = "Sign In";
    btn.disabled = false;
  }
};

/* ================= SIGN UP ================= */

window.handleSignup = async () => {
  const f = document.getElementById("reg-fname").value;
  const l = document.getElementById("reg-lname").value;
  const e = document.getElementById("reg-email").value;
  const p = document.getElementById("reg-pass").value;
  const btn = signupBody.querySelector(".btn");

  if (!f || !e || !p) {
    showStatus("⚠ Required fields missing", true);
    return;
  }

  btn.innerText = "Creating...";
  btn.disabled = true;

  try {
    const res = await createUserWithEmailAndPassword(auth, e, p);
    await setDoc(doc(db, "users", res.user.uid, "profile", "data"), {
      firstName: f,
      lastName: l,
      email: e,
      uid: res.user.uid
    });

    showStatus("✅ Account created");
    setTimeout(closeModal, 1500);
  } catch (err) {
    showStatus("❌ Signup failed", true);
    btn.innerText = "Create Account";
    btn.disabled = false;
  }
};

/* ================= GOOGLE ================= */
window.handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
const googleBtnText = document.querySelector('.google-btn span');
    const originalText = googleBtnText.innerText;
    
    googleBtnText.innerText = "Connecting Google...";
    
    try {
        const result = await signInWithPopup(auth, provider);
        const nameParts = result.user.displayName ? result.user.displayName.split(' ') : ["User"];
        const fName = nameParts[0];

        await setDoc(doc(db, "users", result.user.uid, "profile", "data"), {
            firstName: fName,
            lastName: nameParts.slice(1).join(' ') || "",
            email: result.user.email,
            uid: result.user.uid
        }, { merge: true });

        showStatus("✅ গুগল লগইন সফল!");
        setTimeout(() => authOverlay.classList.remove('active'), 1500);
  } catch (error) {
        handleAuthError(error);
        googleBtnText.innerText = originalText;
    }
};

/* ================= AUTO OPEN FROM HEADER ================= */
window.openLoginModal = openModal;
