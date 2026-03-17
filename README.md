# VLoc - Advanced Virtual Location Toolkit

VLoc is a cross-platform, high-performance GPS spoofer and virtual location tool. Designed from the ground up to be modular, it relies on a robust Monorepo architecture to unify development across platforms.

## Multi-Platform Support
- **Desktop:** Windows, macOS, Linux (via Tauri v2)
- **Mobile:** Android, iOS (via Tauri v2)

## Architectural Blueprint
VLoc is structured using **Turborepo** with **pnpm workspaces**. It enforces strict separation of concerns through an **Atomic Design** UI system and a **Contract-First** API approach.

```text
vloc-monorepo/
├── apps/
│   └── desktop-mobile/        # The Main Application (Tauri v2 + React)
├── packages/                  # Shared Packages
│   ├── vloc-ui/               # Atomic Design UI Components
│   ├── vloc-core/             # Business Logic & Zustand Stores
│   ├── vloc-api-bindings/     # Generated TS Interfaces from Rust Specta
│   ├── config-typescript/     # Base tsconfigs
│   └── config-biome/          # Shared Lint/Format rules
└── crates/                    # Pure Rust Workspaces
    ├── vloc-engine/           # Pure math/simulation logic for GPS
    └── vloc-os-mock/          # OS-specific Location Mocking Plugins
```

## Project Philosophy
1.  **Strict Type Safety**: End-to-end types from Rust structs to React components.
2.  **Modular by Default**: Every component is isolated and independently testable.
3.  **Core Engineering Rules**: All code must follow the "Why/How" documentation protocol and Intermediate English standard.

## Tech Stack
-   **Frameworks:** Tauri v2, React, Vite.
-   **Language:** Rust (Engine/OS), TypeScript (UI/Glue).
-   **State Management:** Zustand (Stores), TanStack Query (Server State).
-   **Type Safety:** Specta & `vloc-api-bindings` for IPC contracts.
-   **Documentation:** Storybook (UI) and `rustdoc` (Engine).

## Getting Started

### Prerequisites
1.  **Node.js** (>= 18) and **pnpm** (>= 8).
2.  **Rust** & Cargo (`rustup`).
3.  OS-specific build dependencies (C++ build tools, WebView2, etc.).

### Setup & Development

```bash
# 1. Install dependencies and link workspaces
pnpm install

# 2. Synchronize API Contracts (Rust types -> TS)
# This generates types in packages/vloc-api-bindings/src/bindings.ts
cd crates/vloc-engine
cargo run --bin export_bindings

# 3. Start development environment
cd ../..
pnpm dev
```

## Commands

- `pnpm dev` - Start development server.
- `pnpm build` - Compile and build the entire monorepo using Turborepo.
- `pnpm lint` - Run Biome checks against all packages.
- `pnpm format` - Auto-format all code using Biome.
- `pnpm test` - Run test suites across the project.

## Quality Control & Git Strategy
This repository strictly adheres to **Conventional Commits** (e.g., `feat(ui): add button`, `fix(core): sync bug`).
All commits are verified through pre-commit hooks (Husky + lint-staged) enforcing Biome formatting and lints.

## License
[GNU General Public License v3.0](LICENSE) - Code is free to use but derived works must also be open source.
