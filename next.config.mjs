/** @type {import('next').NextConfig} */
const preview = process.env.PREVIEW_EXPORT === '1';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  // `npm run preview:export` builds a static copy that can be opened from any folder.
  ...(preview ? { output: 'export', assetPrefix: '.', images: { unoptimized: true } } : {}),
};

export default nextConfig;
