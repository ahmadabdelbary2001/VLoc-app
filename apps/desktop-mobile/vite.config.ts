import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    fs: {
      allow: ["..", "../../packages"],
    },
    port: 1422,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  optimizeDeps: {
    exclude: ["@vloc/ui", "@vloc/api-bindings"],
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    // Minimum targets that support BigInt literals across all platforms:
    //   - Chrome  67+ (Windows, Linux, Android WebView)
    //   - Safari 14+  (macOS, iOS)
    // 'safari13' was the culprit — BigInt only landed in Safari 14.
    target: (() => {
      const platform = process.env.TAURI_ENV_PLATFORM;
      if (platform === 'android' || platform === 'ios') return 'chrome114';
      if (platform === 'macos')                          return 'safari16';
      return 'chrome105'; // windows, linux, default
    })(),
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
