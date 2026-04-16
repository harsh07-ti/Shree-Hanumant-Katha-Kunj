import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCMviIkgoOXjgD08clUKqA7TdvBIXznbds",
  authDomain: "ram-naam-jaap-6304b.firebaseapp.com",
  databaseURL: "https://ram-naam-jaap-6304b-default-rtdb.firebaseio.com",
  projectId: "ram-naam-jaap-6304b",
  storageBucket: "ram-naam-jaap-6304b.firebasestorage.app",
  messagingSenderId: "867006669793",
  appId: "1:867006669793:web:ed403804805b40008428a0",
  measurementId: "G-PN6S0SVHZK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
