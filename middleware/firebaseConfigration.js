import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlJbuAZmOO3QZH1VAEQl7ADInuHHplq4k",
  authDomain: "immofind-46ef8.firebaseapp.com",
  databaseURL: "https://immofind-46ef8-default-rtdb.firebaseio.com",
  projectId: "immofind-46ef8",
  storageBucket: "immofind-46ef8.firebasestorage.app",
  messagingSenderId: "111253434393",
  appId: "1:111253434393:web:3cae6ce408d2cc237a3a88",
  measurementId: "G-8D6RVRDZCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseConfigration = getFirestore(app); // Initialize Firestore

export { firebaseConfigration };
