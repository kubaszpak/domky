// Import the functions you need from the SDKs you need
import { getApps, initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: "domky-1c94a.firebaseapp.com",
	projectId: "domky-1c94a",
	storageBucket: "domky-1c94a.appspot.com",
	messagingSenderId: "765624401638",
	appId: "1:765624401638:web:b856f42f8d70aaa1a10527",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export default firestore;
