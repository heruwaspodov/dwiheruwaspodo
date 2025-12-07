import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAnAsDsn0ZKeMxJhUoorJl3rMHwlYEHJT8",
    authDomain: "dwiheruwaspodo.firebaseapp.com",
    databaseURL: "https://dwiheruwaspodo.firebaseio.com",
    projectId: "dwiheruwaspodo",
    storageBucket: "dwiheruwaspodo.appspot.com",
    messagingSenderId: "68803774438"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

export { database, ref, push, firestore, doc, getDoc, collection, getDocs };
