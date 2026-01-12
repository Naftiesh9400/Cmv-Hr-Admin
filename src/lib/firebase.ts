import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwkEawqCYikteWQWPzuBfapufnWaablrU",
  authDomain: "ems-employee-d233e.firebaseapp.com",
  databaseURL: "https://ems-employee-d233e-default-rtdb.firebaseio.com",
  projectId: "ems-employee-d233e",
  storageBucket: "ems-employee-d233e.firebasestorage.app",
  messagingSenderId: "877317886732",
  appId: "1:877317886732:web:664a6f19735dcf05d7af29",
  measurementId: "G-V2FT5VD4X1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
