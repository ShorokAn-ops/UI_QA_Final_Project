/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow external dev origins (e.g. ngrok)
  allowedDevOrigins: [
    "https://*.ngrok-free.dev",
    "https://*.ngrok.app",
  ],

  // Proxy API requests from frontend -> backend
  // In CI: uses NEXT_PUBLIC_API_URL
  // Locally: proxies to localhost:8081
  async rewrites() {
    // Skip rewrites in CI - use NEXT_PUBLIC_API_URL directly
    if (process.env.CI) {
      return [];
    }
    
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8081/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
