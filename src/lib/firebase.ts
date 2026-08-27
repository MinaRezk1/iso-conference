import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Silence non-fatal SDK network connection logs in container environments
try {
  setLogLevel("error");
} catch (e) {
  console.warn("Could not set Firebase log level", e);
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// NOTE: We deliberately do NOT use Firestore's offline persistent cache
// here. With multiple admins editing shared live data (scores, rooms,
// groups) at a conference where WiFi/cellular can be weak, persistence
// makes writes appear to succeed instantly in the UI (from the local
// cache) even when they haven't actually reached the server yet. If the
// connection drops or the page is refreshed before the sync completes,
// that change is silently lost with no error shown — exactly the "did
// something, refreshed, and it vanished" symptom. Using plain
// getFirestore() means every write's success/failure reflects the real
// server state, and all connected users stay consistently in sync.
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { db };

