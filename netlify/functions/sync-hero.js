import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN)
    )
  });
}

export async function handler() {
  try {
    const db = admin.firestore();

    // 🔹 Firebase থেকে hero data
    const snap = await db.doc("siteConfig/hero").get();
    const slides = snap.exists ? snap.data().slides : [];

    // 🔹 hero.json overwrite
    const filePath = path.join(process.cwd(), "hero.json");
    fs.writeFileSync(filePath, JSON.stringify(slides, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: e.toString()
    };
  }
}
