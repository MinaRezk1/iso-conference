import { initializeApp } from "firebase/app";
import { 
  getFirestore,
  initializeFirestore, 
  setLogLevel, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Silence non-fatal SDK network connection logs in container environments
try {
  setLogLevel("error");
} catch (e) {
  console.warn("Could not set Firebase log level", e);
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

let db: ReturnType<typeof getFirestore>;

try {
  // Initialize with multi-tab persistence for real-time instant sync
  db = firebaseConfig.firestoreDatabaseId
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      }, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
} catch (e) {
  console.warn("Persistent cache initialization failed, falling back to standard getFirestore", e);
  try {
    db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } catch (err) {
    console.error("Firestore initialization error:", err);
    db = getFirestore(app);
  }
}

export { db };



