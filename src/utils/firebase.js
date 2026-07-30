import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase web config gizli bir anahtar değildir — proje kimliğidir.
// Gerçek güvenlik Firestore Rules ile sağlanır.
const firebaseConfig = {
  apiKey: "AIzaSyBSpkgsgmaQxStwbXT_Ne3kW98BjJjaNHI",
  authDomain: "mevzuv1.firebaseapp.com",
  projectId: "mevzuv1",
  storageBucket: "mevzuv1.firebasestorage.app",
  messagingSenderId: "840585016949",
  appId: "1:840585016949:web:5191ddc8323b5aa2492a3c",
  measurementId: "G-69DJFYQSD2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
