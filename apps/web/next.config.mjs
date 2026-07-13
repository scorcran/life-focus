/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip Next.js built-in TypeScript checking — we run tsc --build separately
  // (Next.js 16.2's TS checker is incompatible with TypeScript 7.x)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
