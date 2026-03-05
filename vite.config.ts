import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SchemaCraft30",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "@supabase/supabase-js"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@supabase/supabase-js": "supabaseJs",
        },
      },
    },
  },
});
