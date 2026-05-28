# 🏛️ Cara E-Commerce System Architecture Guide

This document describes the architectural layout, data flow patterns, and development guidelines of the Cara E-Commerce platform.

## 📦 Directory Structure Overview

```bash
Cara/
├── docs/                     # Documentation guidelines
│   └── ARCHITECTURE.md       # [THIS FILE] Core architecture spec
├── state.js                  # Centralized Pub-Sub Reactive State Engine
├── dom-security.js           # Security Input Sanitizer (XSS Mitigation)
├── app.js                    # Main client application logic
├── style.css                 # Main layout styling definitions
├── index.html                # Entry home layout
└── shop.html                 # Product catalog layout
```

## 🔄 Core Architectural Layers

### 1. Unified State Manager (`state.js`)
Cara implements a centralized **Pub-Sub (Publish-Subscribe) State Engine** to maintain state consistency across contexts (e.g. cart modifications, authentications, wishlist toggles). This layer avoids local/global mismatch states and facilitates instant cross-tab synchronization.

### 2. Client Controller Layer (`app.js`)
Interacts with raw DOM elements, subscribes to reactive data hooks from the state layer, handles layout animations, and dynamically updates structural templates based on user actions.

### 3. Security Sanitizer Layer (`dom-security.js`)
A proactive input validation filter designed to neutralize Cross-Site Scripting (XSS) injection vectors on form submissions, converting potentially harmful script tags into safe HTML characters.

---
*Created in GSSOC / ELUSOC 2026 guidelines for clean, high-performance vanilla layouts.*
