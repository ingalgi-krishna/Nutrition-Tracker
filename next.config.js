/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Removed custom webpack config that was causing errors
};

module.exports = nextConfig;