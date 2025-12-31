import admin from "firebase-admin";
import fs from "fs";

/* ================= FIREBASE INIT ================= */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

/* ================= HELPERS ================= */
async function getLastSyncTime() {
  const snap = await db.doc("meta/products_sync").get();
  return snap.exists ? snap.data().lastUpdatedAt?.toMillis() || 0 : 0;
}

async function setLastSyncTime() {
  await db.doc("meta/products_sync").set(
    { lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

/* ================= PRODUCTS ================= */
async function syncProducts() {
  const snap = await db
    .collection("products")
    .orderBy("meta.updatedAt", "desc")
    .get();

  const products = snap.docs.map(d => {
    const { meta, ...rest } = d.data();
    return { id: d.id, ...rest };
  });

  // 🔒 Stable order
  products.sort((a, b) => a.id.localeCompare(b.id));

  writeJSON("./assets/json/products.json", products);

  console.log("Products synced:", products.length);
}

/* ================= HERO ================= */
async function syncHero() {
  const snap = await db.collection("hero").get();
  const heroes = snap.docs.map(d => {
    const { meta, ...rest } = d.data();
    return rest;
  });

  writeJSON("./assets/json/hero.json", heroes);
  console.log("Hero synced:", heroes.length);
}

/* ================= RUN ================= */
async function main() {
  try {
    await syncProducts();
    await syncHero();
    await setLastSyncTime();
    console.log("All sync complete ✅");
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

main();
