import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
      // Force pre-bundling to fix issues with Firebase
      optimizeDeps: {
        include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
      },
      // Print environment variables for debugging (excluding secrets)
      hmr: {
        overlay: true,
      },
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Properly load environment variables
    define: {
      // Make env variables available at build time
      'process.env': env
    },
    // Helpful for debugging
    build: {
      sourcemap: true,
    },
  };
});
