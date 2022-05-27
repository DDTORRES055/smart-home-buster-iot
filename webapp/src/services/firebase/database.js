import {
  getDatabase,
  ref,
  onValue,
  off,
  get,
} from "firebase/database";
import { app } from "./app";

const db = getDatabase(app);

export const setListener = (path, callbackOnValue) => {
  const listenerRef = ref(db, path);
  onValue(listenerRef, (snapshot) => {
    callbackOnValue(snapshot.val());
  });
};

export const removeListener = (path) => {
  const listenerRef = ref(db, path);
  off(listenerRef);
};
