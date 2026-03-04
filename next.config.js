/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://qcunxnadjxggizdksvay.supabase.co wss://qcunxnadjxggizdksvay.supabase.co https://api.anthropic.com https://api.resend.com https://fonts.googleapis.com https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "frame-src 'none'",
            ].join('; ')
          }
        ],
      },
    ];
  },
}
module.exports = nextConfig;
