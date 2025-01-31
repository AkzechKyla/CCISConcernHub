const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onValueCreated } = require("firebase-functions/v2/database");

initializeApp();

exports.closeInactiveConcerns = onSchedule("every 24 hours", async () => {
    const DEADLINE_DAYS = 30;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() - DEADLINE_DAYS);

    const db = await getFirestore();
    const concernsSnapshot = await db.collection("concerns")
        .where("recentActivityDate", "<=", deadline)
        .where("status", "!=", "Closed")
        .get();

    const batch = db.batch();
    concernsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { status: "Closed" });

        if (doc.data().hasBeenResolvedByAdmin == true) {
            batch.update(doc.ref, { isResolved: true });
        }
    });

    await batch.commit();
});

exports.applyRecentActivityDate = onValueCreated(
    {
        ref: "/threads/{threadId}/{messageId}",
        region: "asia-southeast1",
    },
    async (event) => {
        const threadId = event.params.threadId;
        const firestore = await getFirestore();
        const docRef = firestore.collection("concerns").doc(threadId);
        await docRef.update({ "recentActivityDate": new Date() });
    }
);
