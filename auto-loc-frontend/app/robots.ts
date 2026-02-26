import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/location/*',
          '/vehicle/*',
          '/explorer',
          '/how-it-works',
          '/contact',
        ],
        disallow: [
          '/dashboard/*',
          '/api/*',
          '/profile/*',
          '/reservations/*',
          '/settings/*',
        ],
      },
    ],
    sitemap: 'https://autoloc.sn/sitemap.xml',
  };
}
