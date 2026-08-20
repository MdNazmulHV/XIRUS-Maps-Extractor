<div align="center">

# ⬢ XIRUS Maps Extractor PRO

**High-performance Chromium engine for uncompressed media extraction from Google Maps.**

[![GitHub Release](https://img.shields.io/github/v/release/MdNazmulHV/XIRUS-Maps-Extractor?color=00f2fe&style=for-the-badge)](https://github.com/MdNazmulHV/XIRUS-Maps-Extractor/releases)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34c759?style=for-the-badge)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Platform](https://img.shields.io/badge/Platform-Chromium%20%7C%20Brave%20%7C%20Edge-informational?style=for-the-badge)](https://github.com/MdNazmulHV/XIRUS-Maps-Extractor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## ⚡ Overview

**XIRUS Maps Extractor PRO** is an automated data harvesting browser extension built on Manifest V3. Engineered for researchers, digital archivists, and geospatial marketers, it bypasses client-side web compression to pull original-quality images and full-resolution videos directly from Google Maps location directories.

---

## 🚀 Core Capabilities

* **Zero-Loss Source Pulls:** Bypasses dynamic web compression parameters (`=s0-d`) to fetch raw, full-resolution uploaded images.
* **Waterfall Video Resolution Pipeline:** Probes Google upstream servers via automated `HEAD` requests to extract the highest available bitrate (`1080p Full HD` → `720p HD` → `360p`).
* **Cyber-Glassmorphism Floating HUD:** Hardware-accelerated draggable interface featuring live progress metrics, size-filtering thresholds, and visual packet transfer animations.
* **Chronological Asset Archival:** Scrapes contextual upload metadata from the active DOM to sort downloaded media into year-based directory structures (`Project_Name/YYYY/`).
* **Aggressive DOM Traverser:** Multi-container recursive scroll engine designed to bypass Google's lazy-load throttling without missing assets.

---

## 📊 Technical Architecture

| Component | Technology / Protocol | Purpose |
| :--- | :--- | :--- |
| **Runtime Core** | Chromium Manifest V3 | Background service worker routing & downloads |
| **UI Framework** | Cyber-Glassmorphism CSS3 | Drag-and-drop HUD with dynamic state transitions |
| **Resolution Router** | HTTP `HEAD` Probing | Waterfall validation for MP4 streams |
| **Storage Engine** | `chrome.downloads` API | Local automated file naming and directory mapping |

---

## 📦 Installation Guide

1. Clone or download the repository:
   ```bash
   git clone https://github.com/MdNazmulHV/XIRUS-Maps-Extractor.git