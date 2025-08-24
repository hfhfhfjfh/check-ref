const admin = require("firebase-admin");

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
const targetUid = "8XE8XOQm6qOuDSdIFlp6gd4bpSJ2";

async function getUserInvites(uid) {
  try {
    const ref = db.ref(`users/${uid}/dailyInvites`);
    const snapshot = await ref.once("value");

    if (snapshot.exists()) {
      const invites = [];

      snapshot.forEach(child => {
        invites.push({
          inviteUid: child.key,
          timestamp: child.val()
        });
      });

      // Sort by newest first
      invites.sort((a, b) => b.timestamp - a.timestamp);

      // Group by date
      const grouped = {};
      invites.forEach(invite => {
        const dateObj = new Date(Number(invite.timestamp));
        const dateKey = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        });

        const timeFormatted = dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC"
        });

        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          uid: invite.inviteUid,
          time: timeFormatted
        });
      });

      // Print results
      console.log(`✅ Invites for user: ${uid}\n`);
      Object.entries(grouped).forEach(([date, list]) => {
        console.log(`📅 ${date}`);
        list.forEach(item => {
          console.log(`   ⏰ ${item.time} → UID: ${item.uid}`);
        });
        console.log("-------------------------");
      });
    } else {
      console.log(`⚠️ No invites found for user ${uid}`);
    }
  } catch (err) {
    console.error("❌ Error fetching data:", err);
  }
}

getUserInvites(targetUid);
