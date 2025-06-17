// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZNnucpviRMwqCJHcLZawUhpqmf6e74wI",
  authDomain: "nebula-47ac2.firebaseapp.com",
  databaseURL: "https://nebula-47ac2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nebula-47ac2",
  storageBucket: "nebula-47ac2.firebasestorage.app",
  messagingSenderId: "220259375429",
  appId: "1:220259375429:web:23b56e7f55cf58f9adc62c",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };