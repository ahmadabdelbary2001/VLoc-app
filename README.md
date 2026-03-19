# VLoc - Advanced Virtual Location Toolkit

VLoc is a cross-platform, high-performance GPS spoofer and virtual location tool. Designed from the ground up to be modular, it relies on a robust Monorepo architecture to unify development across platforms.

**Current Version**: `1.0.0`

## 🚀 Key Features (v0.1.0)
- **Multi-Platform**: Windows (MSI/EXE) and Android (APK) ready.
- **Location Inaccuracy (Jitter)**: Simulate authentic GPS drift with random deviation (0-50m+).
- **High-Contrast "Solid" UI**: Vibrant, high-visibility action buttons (Green/Red) and premium glassy overlays.
- **Android 15 Ready**: Fully compatible with SDK 35 (Android 15 stable).
- **Self-Contained Windows**: Built-in WebView2 runtime support for seamless installation.

## 👋 Multi-Platform Support
- **Desktop:** Windows (Signed MSI/EXE), macOS (planned), Linux (planned).
- **Mobile:** Android (SDK 35), iOS (planned).

## 🏗️ Architectural Blueprint
VLoc is structured using **Turborepo** with **pnpm workspaces**.

```text
vloc-monorepo/
├── apps/
│   └── desktop-mobile/        # The Main Application (Tauri v2 + React)
├── packages/                  # Shared Packages
│   ├── vloc-ui/               # Atomic Design UI Components
│   ├── vloc-core/             # Business Logic & Zustand Stores
│   ├── vloc-api-bindings/     # Generated TS Interfaces from Rust Specta
└── crates/                    # Pure Rust Workspaces
    ├── vloc-engine/           # Pure math/simulation logic for GPS
    └── vloc-os-mock/          # OS-specific Location Mocking Plugins
```

## 🛠️ Tech Stack
-   **Frameworks:** Tauri v2, React, Vite.
-   **Language:** Rust (Engine), TypeScript (UI).
-   **Type Safety:** Specta & `vloc-api-bindings` for IPC contracts.
-   **Styling**: Tailwind CSS & Vanilla CSS (Atomic Design).

## 🏁 Getting Started

### Prerequisites
1.  **Node.js** (>= 18) and **pnpm** (>= 8).
2.  **Rust** & Cargo (`rustup`).

### Development
```bash
pnpm install
pnpm dev
```

### Build & Export (Root Shortcuts)
- `pnpm tauri build` - Build Windows (MSI/EXE) installers.
- `pnpm android:build` - Generate optimized, signed Android APKs.
- `pnpm lint` / `pnpm format` - Project-wide code quality checks.

## 📜 License
[GNU General Public License v3.0](LICENSE) - Code is free to use but derived works must also be open source.
