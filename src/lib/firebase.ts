import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseAppletConfig) : getApps()[0];
export const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

