import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { getAuth } from 'firebase/auth';
import 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_qCsoJzHanCIgaIjoD3zgniCSmOyUNdE",
  authDomain: "fauxnance-banking.firebaseapp.com",
  projectId: "fauxnance-banking",
  storageBucket: "fauxnance-banking.appspot.com",
  messagingSenderId: "540035923656",
  appId: "1:540035923656:web:9904c96114f1e59c806ffd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);