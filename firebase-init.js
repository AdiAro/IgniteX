// ===== Firebase setup for Ignite X =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, getDoc, updateDoc,
  getDocs, query, orderBy, arrayUnion
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpK2yXhk4YSBmCdW3B-xmRbnFd-5dCNfI",
  authDomain: "ignitex-f0838.firebaseapp.com",
  projectId: "ignitex-f0838",
  storageBucket: "ignitex-f0838.firebasestorage.app",
  messagingSenderId: "1024393790031",
  appId: "1:1024393790031:web:cf8ea53be0370c673d603a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export {
  collection, addDoc, doc, getDoc, updateDoc, getDocs, query, orderBy, arrayUnion
};
