// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_DATABASE_NAME,
  REACT_APP_FIREBASE_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID,
} = process.env;

if (
  !REACT_APP_FIREBASE_API_KEY ||
  !REACT_APP_FIREBASE_PROJECT_ID ||
  !REACT_APP_FIREBASE_DATABASE_NAME ||
  !REACT_APP_FIREBASE_SENDER_ID ||
  !REACT_APP_FIREBASE_APP_ID
) {
  console.error(
    "Missing Firebase configuration. Please set the following environment variables:\n",
    "REACT_APP_FIREBASE_API_KEY,\n",
    "REACT_APP_FIREBASE_PROJECT_ID,\n",
    "REACT_APP_FIREBASE_DATABASE_NAME,\n",
    "REACT_APP_FIREBASE_SENDER_ID,\n",
    "REACT_APP_FIREBASE_APP_ID,\n"
  );
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: REACT_APP_FIREBASE_API_KEY,
  authDomain: `${REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${REACT_APP_FIREBASE_DATABASE_NAME}.firebaseio.com`,
  projectId: REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: REACT_APP_FIREBASE_SENDER_ID,
  appId: REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
