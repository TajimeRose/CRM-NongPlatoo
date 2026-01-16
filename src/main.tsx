import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Firebase auth state listener for user sync
import { initAuthStateListener } from "./lib/firebase";
initAuthStateListener();

createRoot(document.getElementById("root")!).render(<App />);
