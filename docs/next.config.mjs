import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  // This docs app lives inside the Lumexia repo, which has its own lockfile at the
  // root. Pin the workspace root to this folder so Next/Turbopack doesn't infer the
  // parent app as the root and pull its instrumentation.ts into the docs build.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withMDX(config);
