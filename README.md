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

## Tech Stack
- **Frameworks:** Tauri v2, React, Vite
- **Language:** Rust (Backend), TypeScript (Frontend)
- **Styling:** Tailwind CSS
- **State Management:** Zustand, TanStack Query
- **Tooling:** Biome (Lint/Format), Husky (Git Hooks), Storybook (UI Docs)
- **Type Safety:** tauri-specta (End-to-end TS bindings)

## Getting Started

### Prerequisites
1. **Node.js** (>= 18)
2. **pnpm** (>= 8)
3. **Rust** & Cargo (`rustup`)
4. OS-specific build dependencies for Tauri.

### Setup

```bash
# 1. Install dependencies and link workspaces
pnpm install

# 2. Setup git hooks (Husky)
pnpm run prepare

# 3. Start development server (React + Tauri)
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
