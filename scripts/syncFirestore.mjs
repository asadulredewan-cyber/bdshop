
import fs from "fs";
import admin from "firebase-admin";

// 🔐 Service Account (GitHub Secret থেকে)
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* ================= HELPERS ================= */
async function exportCollection(colName, outputPath) {
  const snapshot = await db.collection(colName).get();
  const data = [];

  snapshot.forEach(doc => {
    data.push(doc.data());
  });

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✔ ${colName} → ${outputPath}`);
}

/* ================= RUN ================= */
(async () => {
  try {
    await exportCollection("hero", "assets/json/hero.json");
    await exportCollection("products", "assets/json/products.json");

    console.log("✅ Firestore sync completed");
  } catch (err) {
    console.error("❌ Sync failed:", err);
    process.exit(1);
  }
})();
