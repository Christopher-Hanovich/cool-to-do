// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//
//
//EDIT OUT BEFORE PUSHING!!!!!
//
//
//
const firebaseConfig = {
  apiKey: "AIzaSyBXsLwIOgezM2_sLmkBA-t-BosTDp6ADJE",
  authDomain: "cool-to-do-d2069.firebaseapp.com",
  projectId: "cool-to-do-d2069",
  storageBucket: "cool-to-do-d2069.firebasestorage.app",
  messagingSenderId: "81453333484",
  appId: "1:81453333484:web:261a157cafb89dcaf59ec9"
};
//
//
//EDIT OUT BEFORE PUSHING!!!!!
//
//
//

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app);
export const db = getFirestore(app);