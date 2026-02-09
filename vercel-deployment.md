# Vercel Deployment Configuration
# This file ensures Vercel properly detects and builds the project

vercel.json settings:
- Version: 2
- Build command: npm run vercel-build
- Output directory: public
- Install command: npm install
- Development command: npm run dev

Cache Settings:
- All assets: max-age=0 (no cache)
- Force revalidation on every request
- Surrogate control for edge caching

Build Settings:
- Node.js 16+ required
- Dependencies installed automatically
- Build process outputs completion timestamp