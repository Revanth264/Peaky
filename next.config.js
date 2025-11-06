/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https:",
              // Next.js dev needs 'unsafe-eval'; reCAPTCHA also injects scripts
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              // Styles and Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images (include data: and blob: for Next.js runtime images)
              "img-src 'self' https: data: blob: https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              // API calls (Firebase Identity Toolkit, Google APIs, token, Firestore; include websockets for dev)
              "connect-src 'self' https://identitytoolkit.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://accounts.firebase.com https://www.facebook.com https://graph.facebook.com https://appleid.apple.com https://login.microsoftonline.com ws: wss:",
              // OAuth provider frames (Google, Facebook, Apple, Microsoft)
              "frame-src 'self' https://www.google.com/recaptcha/ https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://login.microsoftonline.com",
              // OAuth redirects
              "form-action 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://login.microsoftonline.com"
            ].join('; ')
          }
        ]
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Exclude firebase-admin from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

