import fs from "fs";
import admin from "firebase-admin";

/* ================= INIT FIREBASE ================= */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

/* ================= PATHS ================= */
const PRODUCTS_JSON = "assets/json/products.json";
const HERO_JSON = "assets/json/hero.json";
const CACHE_FILE = "scripts/.lastSync.json";

/* ================= HELPERS ================= */
function readCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

function writeCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

/* ================= MAIN ================= */
async function sync() {
  const cache = readCache();

  /* ---------- PRODUCTS ---------- */
  const catalogSnap = await db.doc("meta/catalog").get();
  if (!catalogSnap.exists) {
    console.log("Catalog not found");
    return;
  }

  const catalog = catalogSnap.data();
  const catalogUpdatedAt =
    catalog.updatedAt?.toMillis?.() || null;

  if (catalogUpdatedAt !== cache.catalogUpdatedAt) {
    console.log("🔄 Products changed");

    fs.writeFileSync(
      PRODUCTS_JSON,
      JSON.stringify(catalog.products || [], null, 2)
    );

    cache.catalogUpdatedAt = catalogUpdatedAt;
  } else {
    console.log("✅ Products unchanged");
  }

  /* ---------- HERO ---------- */
  const heroSnap = await db.collection("hero").get();

  let latestHeroUpdate = null;
  const heroes = heroSnap.docs.map(doc => {
    const data = doc.data();
    const updated = data.meta?.updatedAt?.toMillis?.() || 0;
    if (!latestHeroUpdate || updated > latestHeroUpdate) {
      latestHeroUpdate = updated;
    }
    return { id: doc.id, ...data };
  });

  if (latestHeroUpdate !== cache.heroUpdatedAt) {
    console.log("🔄 Hero changed");

    fs.writeFileSync(
      HERO_JSON,
      JSON.stringify(heroes, null, 2)
    );

    cache.heroUpdatedAt = latestHeroUpdate;
  } else {
    console.log("✅ Hero unchanged");
  }

  writeCache(cache);
  console.log("✅ Sync finished");
}

sync().catch(err => {
  console.error("❌ Sync failed", err);
  process.exit(1);
});
