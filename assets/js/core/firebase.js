/* ================================
   firebase.js
   ONLY Firebase Init & Exports
================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-7Vh42USod2GdIzXEsDqKxQfeUHwFFDI",
  authDomain: "ecom-81a47.firebaseapp.com",
  projectId: "ecom-81a47",
  storageBucket: "ecom-81a47.firebasestorage.app",
  messagingSenderId: "929836126716",
  appId: "1:929836126716:web:bd75e4b61a1336d2166279",
  measurementId: "G-QLBXSS3Z9K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
