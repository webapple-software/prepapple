const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: "AIzaSyDpyExy7OmCOr3pQ8Gkzzhbs0GU3Rfh1E0",
  authDomain: "webapple-cbtportal2233.firebaseapp.com",
  projectId: "webapple-cbtportal2233",
  storageBucket: "webapple-cbtportal2233.firebasestorage.app",
  messagingSenderId: "293794677110",
  appId: "1:293794677110:web:572ff3b057850f5bbc7a57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase Firestore Initialized successfully.");

module.exports = db;
