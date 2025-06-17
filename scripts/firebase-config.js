// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZNnucpviRMwqCJHcLZawUhpqmf6e74wI",
  authDomain: "nebula-47ac2.firebaseapp.com",
  databaseURL: "https://nebula-47ac2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nebula-47ac2",
  storageBucket: "nebula-47ac2.appspot.com",
  messagingSenderId: "220259375429",
  appId: "1:220259375429:web:23b56e7f55cf58f9adc62c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);