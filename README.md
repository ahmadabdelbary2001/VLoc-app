# 📍 **VLoc App (v1.2.3)**
> _محاكي مواقع افتراضي متقدم (GPS Spoofer) مهيأ بالكامل لنظام Android 15 وبيئات Windows المستقلة، يعتمد على معمارية Monorepo متقدمة للعمل المتوازي._

<div align="center">
  <img src="https://img.shields.io/badge/Language-English-blue?style=flat-square" alt="English">
  <a href="locales/README.en.md">English Version</a> |
  <img src="https://img.shields.io/badge/Language-Arabic-green?style=flat-square" alt="Arabic">
  <a href="#">النسخة العربية</a>
</div>

---

## 📖 **نظرة عامة**
> _تطبيق VLoc هو أداة متطورة للمطورين تتيح تزييف الموقع الجغرافي بأداء عالٍ. يركز التحديث الجديد على معمارية Turborepo، وتوافقية أندرويد 35، واستخدام Specta لضمان أمان التخاطب بين لغتي Rust و TypeScript._

---

## 📋 **قائمة المحتويات** <a id="toc"></a>
1. [✨ المميزات الرئيسية](#features)
2. [💻 التقنيات المستخدمة](#tech-stack)
3. [🚀 ابدأ الآن](#getting-started)
4. [🧭 محرك الرياضيات للـ GPS](#gps-math-engine)
5. [📁 هيكلية المشروع (Monorepo)](#project-structure)
6. [📜 التراخيص](#license)

---

## ✨ **المميزات الرئيسية** <a id="features"></a>
- **🌍 توافقية متطورة (Android 15)**: مدعوم بالكامل ليعمل على أحدث أنظمة أندرويد (SDK 35) وتثبيت مستقل مع (WebView2) لنظام ويندوز.
- **📱 أمان التخاطب (Specta)**: عقد أمان (IPC Contracts) يربط واجهة TypeScript مباشرة مع الواجهة الخلفية في الرست لمنع أخطاء التخاطب الكارثية.
- **🔢 محاكاة حية متقدمة (Jitter)**: إضافة حركات ارتدادية عشوائية (0-50m+) لإعطاء طابع موقع طبيعي لا يمكن كشفه وتقليل الانحراف.
- **⚙️ تصميم عالي التباين (Glassmorphism)**: واجهة مستخدم تعتمد على الهيكل الذري (Atomic Design) مع أزرار بارزة وطبقات شفافة حديثة (Glassy overlays).

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

---

## 💻 **التقنيات المستخدمة** <a id="tech-stack"></a>
- **Turborepo & pnpm**: معمارية إدارة الحزم المتقدمة لبناء بيئات مشتركة.
- **Tauri 2.0 & Rust**: للوصول إلى العتاد الأصلي وبناء التطبيقات المستقلة بقوة Rust.
- **Specta**: لتوليد الواجهات البيانية من Rust إلى TypeScript.
- **React & TypeScript**: تصميم وإدارة تفاعلية فائقة.
- **MapLibre GL**: لاستعراض وتحكم بخرائط العالم بدقة.
- **TailwindCSS**: أدوات تنسيق الواجهة.

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

---

## 🚀 **ابدأ الآن** <a id="getting-started"></a>

### المتطلبات الأساسية
- [x] **Node.js (v18+)**
- [x] **Rust (Stable)**
- [x] **Android Studio & NDK** (لترجمة تطبيق الهواتف - Build targets).
- [x] **pnpm** (مثبت عالمياً)

### خطوات التثبيت
1. استنساخ المستودع:
   ```bash
   git clone https://github.com/Ahmad-J-Bary/vloc-app-new.git
   cd VLoc-app-new
   ```

2. تثبيت الحزم:
   ```bash
   pnpm install
   ```

3. تشغيل وضع التطوير:
   ```bash
   pnpm tauri dev
   ```

4. استخراج وبناء المشروع:
   ```bash
   pnpm android:build  # لإنشاء نسخة Android APK
   pnpm tauri build    # لإنشاء نسخة Windows MSI/EXE
   ```

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

---

## 🧭 **محرك الرياضيات للـ GPS** <a id="gps-math-engine"></a>
للخروج من نمط المحاكيات التقليدية، تم بناء محرك رياضيات داخلي مخصص في Rust. يقوم المحرك بتطبيق خوارزميات تسمح للموقع بالتحرك بسرعات ثابتة ومخصصة وإضافة ارتدادات عشوائية (Jitters) ليحاكي تماماً التذبذبات الطبيعية التي يحدثها مستشعر الـ GPS المادي الموجود بالهاتف.

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

---

## 📁 **هيكلية المشروع (Turborepo)** <a id="project-structure"></a>
 ```bash
 VLoc-app-new/
 ├── apps/
 │   └── desktop-mobile/        # التطبيق الأساسي (Tauri v2 + React)
 ├── packages/                  # حزم الـ Frontend
 │   ├── vloc-ui/               # مكونات الـ Atomic Design UI
 │   ├── vloc-core/             # منطق العمل وإدارة الـ Zustand
 │   └── vloc-api-bindings/     # الأنواع المولدة تلقائياً بواسطة Specta
 └── crates/                    # حزم الـ Backend
     ├── vloc-engine/           # محرك الرياضيات والفيزياء (Rust)
     └── vloc-os-mock/          # التخاطب منخفض المستوى مع أنظمة التشغيل (OS)
 ```

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

---

## 📜 **التراخيص** <a id="license"></a>
هذا المشروع مرخص بموجب رخصة GNU General Public License v3.0. راجع ملف `LICENSE` لمزيد من المعلومات.

<div align="center">
  <a href="#toc">🔝 العودة للأعلى</a>
</div>

<p align="center"> تم التطوير بكل ❤️ بواسطة <a href="https://github.com/Ahmad-J-Bary">@Ahmad Abdelbary</a> </p>
