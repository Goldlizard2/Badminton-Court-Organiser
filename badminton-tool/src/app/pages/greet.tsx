"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export default function Greet() {
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    if (window && "__TAURI_IPC__" in window) {
      // Only call Tauri APIs if running in a Tauri environment
      invoke<string>("greet", { name: "Next.js" })
        .then((result) => setGreeting(result))
        .catch(console.error);
    } else {
      console.warn("Not running in a Tauri environment");
      setGreeting("Hello from a non-Tauri environment!");
    }
  }, []);

  return <div>{greeting}</div>;
}