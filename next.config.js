/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow external dev origins (e.g. ngrok)
  allowedDevOrigins: [
    "https://*.ngrok-free.dev",
    "https://*.ngrok.app",
  ],

  // Proxy API requests from frontend -> local backend (8081)
  // This allows using a single ngrok tunnel (3001) for both FE + BE
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8081/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
