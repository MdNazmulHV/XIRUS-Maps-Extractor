# Architecture & Technical Design

This document outlines the architectural pipeline of **XIRUS Maps Extractor PRO**.

## 1. Runtime Core (Chromium Manifest V3)
- **Service Worker (\`background.js\`)**: Handles asynchronous message passing, download lifecycles via \`chrome.downloads\` API, and tab event monitoring.
- **Content Injector**: Scans DOM nodes across lazy-loaded Google Maps location listings and processes media sources.

## 2. Extraction Pipeline
- **Zero-Loss Resolution**: Rewrites dynamic image parameters (e.g., stripping compression tokens like \`=w...-h...\` and \`=s0-d\`) to request master source files.
- **Waterfall Probing**: Sends lightweight HTTP HEAD requests to verify high-bitrate video stream availability before triggering background download streams.

## 3. UI Framework
- **HUD Engine**: Standalone CSS3 Cyber-Glassmorphism HUD injected directly into the active tab without third-party UI framework overhead.
