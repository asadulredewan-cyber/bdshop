import admin from "firebase-admin";
import fs from "fs";

/* ================= FIREBASE INIT ================= */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
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
  const lastSync = await getLastSyncTime();

  const latest = await db
    .collection("products")
    .orderBy("meta.updatedAt", "desc")
    .limit(1)
    .get();

  if (!latest.docs.length) return;

  const latestUpdate =
    latest.docs[0].data().meta?.updatedAt?.toMillis() || 0;

  // ❌ No update → STOP (only 1 read used)
  if (latestUpdate <= lastSync) {
    console.log("No product changes");
    return;
  }

  // ✅ Update found → full read
  const snap = await db.collection("products").get();
  const products = snap.docs.map(d => {
    const { meta, ...rest } = d.data();
    return rest;
  });

  writeJSON("assets/json/products.json", products);
  await setLastSyncTime();

  console.log("Products synced:", products.length);
}

/* ================= HERO ================= */
async function syncHero() {
  const snap = await db.collection("hero").get();
  const heroes = snap.docs.map(d => {
    const { meta, ...rest } = d.data();
    return rest;
  });

  writeJSON("assets/json/hero.json", heroes);
  console.log("Hero synced:", heroes.length);
}

/* ================= RUN ================= */
await syncProducts();
await syncHero();
