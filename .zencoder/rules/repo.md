# Repository Overview

## Project Purpose
Top Home Designers showcases a portfolio of interior-design solutions, highlighting premium materials, custom installations, and decor inspirations. The site serves both as a marketing presence and an educational resource for potential clients seeking remodeling, tiling, painting, and bespoke furnishing services.

## Tech Stack
- **HTML5/CSS3** for layout and styling
- **Vanilla JavaScript** for interactive and dynamic features
- **Node.js/Express** server placeholder (`server.js`) to support future backend integrations
- **Package management** via `npm` (see `package.json` for available scripts and dependencies)

## Key Directories & Files
- **/index.html**: Primary landing page for the Top Home Designers brand.
- **/img/**: Shared imagery assets used across pages.
- **/artstones, /bricks, /eurocone, /gypsum, /marble, /painting, /tiles, /wardrobe, /Mazerous**: Product-focused microsites with dedicated `index.html` files and supporting assets.
- **/hero sections/**: Inspiration imagery for hero banners.
- **/server.js**: Placeholder Node.js server configuration.
- **/.env**: Environment configuration sample (keep sensitive data out of version control).

## Getting Started
1. **Install dependencies** (if not already):
   ```bash
   npm install
   ```
2. **Run development server** (if the project uses `server.js`):
   ```bash
   node server.js
   ```
3. **Open** `index.html` directly in the browser for static preview, or use a lightweight HTTP server for hot reload while editing.

## Coding Guidelines
- **Structure** HTML with semantic sections (`header`, `main`, `section`, `footer`).
- **Modularize** CSS or use scoped styles when introducing new components to avoid conflicts.
- **Optimize** images before adding to the repo; keep large assets in dedicated directories.
- **Comment** tricky logic in JavaScript for future maintainability.

## Contribution Workflow
- **Create feature branches** for substantial changes.
- **Document** new functionality or design updates in accompanying readme or inline comments.
- **Test** interactive features in modern browsers (Chrome, Firefox, Edge) before merging.

## Additional Notes
- Ensure consistency in branding (colors, typography, imagery) across microsites.
- Consolidate reusable components (like nav bars and footers) to maintain a cohesive user experience.
- Consider implementing build tools (e.g., Vite, Webpack) if the project grows in complexity.