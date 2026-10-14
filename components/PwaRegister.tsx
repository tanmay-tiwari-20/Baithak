"use client";

import { useEffect } from "react";

const PwaRegister = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Baithak service worker registration failed", error);
      });
    }
  }, []);

  return null;
};

export default PwaRegister;
