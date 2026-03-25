const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  // ── Stratégies de cache runtime ─────────────────────────────────────────
  runtimeCaching: [

    // 1. Tuiles de carte OpenStreetMap — CacheFirst 7 jours
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. API revendeurs — NetworkFirst 24h
    {
      urlPattern: /^https:\/\/vito-backend-supabase\.onrender\.com\/api\/v1\/resellers.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-resellers',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 3. API promotions — NetworkFirst 1h
    {
      urlPattern: /^https:\/\/vito-backend-supabase\.onrender\.com\/api\/v1\/promotions.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-promotions',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 4. API documents — NetworkFirst 7 jours
    {
      urlPattern: /^https:\/\/vito-backend-supabase\.onrender\.com\/api\/v1\/documents.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-documents',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 5. API delivery companies — NetworkFirst 6h
    {
      urlPattern: /^https:\/\/vito-backend-supabase\.onrender\.com\/api\/v1\/delivery-companies.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-delivery',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 6,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 6. Images Supabase Storage — CacheFirst 30 jours
    {
      urlPattern: /^https:\/\/lqkqasuotgrlqwokquhy\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 7. Autres appels API backend — NetworkFirst 1h (fallback)
    {
      urlPattern: /^https:\/\/vito-backend-supabase\.onrender\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-other',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lqkqasuotgrlqwokquhy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)