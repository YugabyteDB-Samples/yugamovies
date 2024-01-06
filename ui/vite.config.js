import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxying API requests
      "/movies-api": {
        target: "https://34.144.208.255.nip.io", // nip.io Apigee URL
        changeOrigin: true,
      },
      "/auth-api": {
        target: "https://34.144.208.255.nip.io", // nip.io Apigee URL
        changeOrigin: true,
      },
      // "/movies-api": {
      //   target: "http://localhost:8080", // The movies backend server URL
      //   // target: "http://35.236.5.165", // The IP of the Kubernetes service
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/movies-api/, ""),
      // },
      // "/auth-api": {
      //   target: "http://localhost:5000", // The auth backend server URL
      //   // target: "http://34.94.204.34", // The IP of the Kubernetes service
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/auth-api/, ""),
      // },
    },
  },
});
