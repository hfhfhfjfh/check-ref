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
const targetUid = "UHzfnKVGA2c0wBuQ8YXutELAsu13"; // Updated target UID

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
      for (const invite of invites) {
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
      }

      // Fetch emails for each invite UID
      for (const [date, list] of Object.entries(grouped)) {
        console.log(`📅 ${date}`);
        for (const item of list) {
          const userRef = db.ref(`users/${item.uid}`);
          const userSnapshot = await userRef.once("value");

          if (userSnapshot.exists()) {
            const inviterData = userSnapshot.val();
            const inviterEmail = inviterData.email || "Email not available"; // Assuming email is stored under the user's node

            console.log(`   ⏰ ${item.time} → UID: ${item.uid}, Email: ${inviterEmail}`);
          } else {
            console.log(`   ⏰ ${item.time} → UID: ${item.uid}, Email: Data not found`);
          }
        }
        console.log("-------------------------");
      }
    } else {
      console.log(`⚠️ No invites found for user ${uid}`);
    }
  } catch (err) {
    console.error("❌ Error fetching data:", err);
  }
}

getUserInvites(targetUid);
