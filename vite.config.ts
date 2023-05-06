import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});

/// <reference types="vite/client" />

interface Window {
  ethereum: any;
}
