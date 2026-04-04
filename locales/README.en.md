# 📍 **VLoc App (v1.2.3)**
> _An advanced cross-platform GPS spoofer fully adapted for Android 15 and strictly built as a self-contained Windows application, exploiting a resilient Monorepo architecture._

<div align="center">
  <img src="https://img.shields.io/badge/Language-English-blue?style=flat-square" alt="English">
  <a href="#">English Version</a> |
  <img src="https://img.shields.io/badge/Language-Arabic-green?style=flat-square" alt="Arabic">
  <a href="../README.md">Arabic Version</a>
</div>

---

## 📖 **Overview**
> _VLoc is an elite development tool engineered to dynamically mock geographic coordinates at high performance. The newest iteration boasts a Turborepo foundation, SDK 35 (Android 15) compliance, and airtight IPC contracts powered by Specta._

---

## 📋 **Table of Contents** <a id="toc"></a>
1. [✨ Key Features](#features)
2. [💻 Tech Stack](#tech-stack)
3. [🚀 Getting Started](#getting-started)
4. [🧭 Custom GPS Math Engine](#gps-math-engine)
5. [📁 Project Structure (Monorepo)](#project-structure)
6. [📜 License](#license)

---

## ✨ **Key Features** <a id="features"></a>
- **🌍 Cutting-Edge Compatibility**: Ready out-of-the-box for Android 15 (SDK 35) and bundles the WebView2 runtime for seamless self-contained Windows installation.
- **📱 Airtight Operations (Specta)**: Leverages Specta to dynamically generate Type-Safe IPC contracts directly from Rust to TypeScript, killing memory misalignment errors.
- **🔢 Authentic Motion Mapping (Jitter)**: Infuses pseudo-random mathematical deviations (0-50m+) simulating natural GPS sensor drifts avoiding automated spoofing detection.
- **⚙️ High-Contrast Glassmorphism**: Stunning atomic design interface overlaying sleek premium glassy elements for maximum user readability and feel.

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

---

## 💻 **Tech Stack** <a id="tech-stack"></a>
- **Turborepo & pnpm**: Core workspace foundation routing all interconnected domains.
- **Tauri 2.0 & Rust**: Forging the backbone math and OS system bridges bridging into desktop/mobile.
- **Specta**: Producing 100% typed interfaces.
- **React & TypeScript**: Front-end interactive ecosystem.
- **MapLibre GL**: Rapid WebGL interactive global map renderer.
- **Zustand & Atomic CSS**: Atomic component logic and local state management.

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

---

## 🚀 **Getting Started** <a id="getting-started"></a>

### Prerequisites
- [x] **Node.js (v18+)**
- [x] **Rust (Stable)**
- [x] **Android Studio & NDK** (Required to compile mobile builds).
- [x] **pnpm** (Installed globally)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmad-J-Bary/vloc-app-new.git
   cd VLoc-app-new
   ```

2. Install workspace dependencies:
   ```bash
   pnpm install
   ```

3. Boot up the development workspace:
   ```bash
   pnpm dev
   ```

4. Build targeted bundles:
   ```bash
   pnpm android:build  # Generate signed Android APK
   pnpm tauri build    # Generate Windows MSI/EXE
   ```

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

---

## 🧭 **Custom GPS Math Engine** <a id="gps-math-engine"></a>
VLoc isolates a standalone Rust engine implementing custom logic. This mechanism calculates complex physical routes whilst independently rendering natural sensor `Jitters` up to 50 meters—replicating lifelike organic signals that circumvent classic "Virtual Location" constraints naturally.

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

---

## 📁 **Project Structure (Turborepo)** <a id="project-structure"></a>
 ```bash
 VLoc-app-new/
 ├── apps/
 │   └── desktop-mobile/        # Main App Bootstrapper (Tauri v2 + React)
 ├── packages/                  # Frontend Web Assets
 │   ├── vloc-ui/               # Atomic GUI Elements
 │   ├── vloc-core/             # Business Logic & Zustand Maps
 │   └── vloc-api-bindings/     # Automatically Generated TS Interfaces (Specta)
 └── crates/                    # Core Native Subsystems
     ├── vloc-engine/           # Emulation Engine and Mathematics (Rust)
     └── vloc-os-mock/          # Hard OS Call Hooks (JNI and Android)
 ```

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

---

## 📜 **License** <a id="license"></a>
This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for details.

<div align="center">
  <a href="#toc">🔝 Back to Top</a>
</div>

<p align="center"> Developed with ❤️ by <a href="https://github.com/Ahmad-J-Bary">@Ahmad Abdelbary</a> </p>
