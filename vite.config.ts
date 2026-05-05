import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-ui": ["framer-motion", "lucide-react"],
          "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],
          "admin": [
            "./src/pages/admin/Dashboard",
            "./src/pages/admin/Products",
            "./src/pages/admin/Orders",
            "./src/pages/admin/Customers",
            "./src/pages/admin/Categories",
            "./src/pages/admin/AdminLogin",
            "./src/pages/admin/Reviews",
            "./src/pages/admin/AuditLog",
            "./src/pages/admin/Settings",
            "./src/pages/admin/ProductForm",
          ],
        },
      },
    },
  },
});
