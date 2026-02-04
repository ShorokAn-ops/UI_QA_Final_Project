/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow external dev origins (e.g. ngrok)
  allowedDevOrigins: [
    "https://*.ngrok-free.dev",
    "https://*.ngrok.app",
  ],
};

module.exports = nextConfig;
