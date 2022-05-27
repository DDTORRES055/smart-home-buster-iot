import { app } from "./app";
import { getAuth } from "firebase/auth";

const auth = getAuth(app);

export { auth };
