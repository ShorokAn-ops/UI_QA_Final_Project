/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow external dev origins (e.g. ngrok) - domains without protocol
  allowedDevOrigins: [
    "untrusted-cythia-unpunctilious.ngrok-free.dev",
    ".ngrok-free.dev",
    ".ngrok.app",
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

  // Add headers to allow cross-origin requests
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
