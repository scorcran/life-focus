// Allow side-effect CSS imports (e.g. `import './globals.css'`) to type-check
// under plain `tsc --build`. Next.js handles the actual bundling; tsc only needs
// to know these modules resolve.
declare module '*.css';
