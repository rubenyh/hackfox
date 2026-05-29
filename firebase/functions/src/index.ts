/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

if (admin.apps.length === 0) {
  admin.initializeApp();
}

type CreateDriverPayload = {
	email: string;
	password: string;
	fullName: string;
	phone?: string;
	license?: string;
	assignedBusId?: string | null;
};

export const createDriverAccount = onCall(
	{
		region: "us-central1",
		invoker: "public",
        cors: ["http://localhost:3000"],

	},
	async (request) => {


    const data = request.data as Partial<CreateDriverPayload> | undefined;
	const email = data?.email?.trim();
	const password = data?.password;
	const fullName = data?.fullName?.trim();
	const phone = data?.phone?.trim();
	const license = data?.license?.trim();
	const assignedBusId = data?.assignedBusId?.trim() || null;

	if (!email || !password || !fullName) {
		throw new HttpsError("invalid-argument", "Email, password, and full name are required.");
	}
	if (password.length < 6) {
		throw new HttpsError("invalid-argument", "Password must be at least 6 characters.");
	}

	try {
		const userRecord = await admin.auth().createUser({
			email,
			password,
			displayName: fullName,
		});

		await admin.auth().setCustomUserClaims(userRecord.uid, {role: "driver"});

		const db = admin.firestore();
		const createdAt = admin.firestore.FieldValue.serverTimestamp();

		const userRef = db.collection("users").doc(userRecord.uid);
		const driverRef = db.collection("drivers").doc(userRecord.uid);

		const batch = db.batch();
		batch.set(userRef, {
			uid: userRecord.uid,
			email,
			fullName,
			role: "driver",
			createdAt,
		});
		batch.set(driverRef, {
			uid: userRecord.uid,
			email,
			fullName,
			phone: phone || "",
			license: license || "",
			assignedBusId,
			active: true,
			createdAt,
		});

		await batch.commit();

		return {uid: userRecord.uid};
	} catch (error: any) {
		const code = error?.code === "auth/email-already-exists" ? "already-exists" : "internal";
		const message = error?.message || "Failed to create driver account.";
		throw new HttpsError(code, message);
	}
	}
);

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
