// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/analytics';
import dotenv from 'dotenv';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

dotenv.config();

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQebvs0PkwL8b04oFevlKwnKk2cnykpC0",
  authDomain: "findit-910.firebaseapp.com",
  projectId: "findit-910",
  storageBucket: "findit-910.firebasestorage.app",
  messagingSenderId: "936062673316",
  appId: "1:936062673316:web:75d0f6e6883554e0b72131",
  measurementId: "G-K3J5Q9BR5N"
};

// Initializing Firebase
const app = initializeApp(firebaseConfig);

//exporting the app
export { app };