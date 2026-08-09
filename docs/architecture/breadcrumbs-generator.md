# Dynamic Breadcrumbs Navigation Generator Architecture

## Overview
Generates WCAG-compliant dynamic HTML breadcrumb hierarchy trails based on window pathname.

## Usage
```javascript
import { BreadcrumbsGenerator } from './js/breadcrumbs-generator.js';
const generator = new BreadcrumbsGenerator();
const crumbs = generator.generateBreadcrumbs(window.location.pathname);
```
