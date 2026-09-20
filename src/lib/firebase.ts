import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// The configuration is automatically managed by the platform environment 
// when the application is deployed, but we stub it out here for modularity.
// Replace with actual config when migrating outside of AI Studio.
const firebaseConfig = {
  // auto-injected in production
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
