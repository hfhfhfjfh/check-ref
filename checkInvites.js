import admin from "firebase-admin";

// Load Firebase Admin JSON from GitHub secret
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

// Initialize Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://starx-network-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

// Fixed UID to check
const targetUid = "8XE8XOQm6qOuDSdIFlp6gd4bpSJ2";

async function getUserInvites(uid) {
  try {
    const ref = db.ref(`users/${uid}/dailyInvites`);
    const snapshot = await ref.once("value");

    if (snapshot.exists()) {
      console.log(`✅ Invites for user: ${uid}\n`);

      snapshot.forEach(child => {
        const inviteUid = child.key;
        const timestamp = child.val();

        // Convert timestamp → human-readable date/time
        const date = new Date(Number(timestamp));
        const formatted = date.toLocaleString("en-GB", { timeZone: "UTC" });

        console.log(`📌 Invited UID: ${inviteUid}`);
        console.log(`⏰ Date & Time (UTC): ${formatted}`);
        console.log("-------------------------");
      });
    } else {
      console.log(`⚠️ No invites found for user ${uid}`);
    }
  } catch (err) {
    console.error("❌ Error fetching data:", err);
  }
}

// Run automatically for fixed UID
getUserInvites(targetUid);
