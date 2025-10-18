import { MetadataRoute } from 'next'

/**
 * Robots.txt Configuration for SEO
 * Controls how search engines crawl and index the site
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Protect API routes
          '/admin/',         // Protect admin dashboard
          '/moderator/',     // Protect moderator dashboard
          '/test-popup',     // Hide test pages
          '/debug-role',     // Hide debug pages
          '/_next/',         // Hide Next.js internals
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/moderator/', '/test-popup', '/debug-role'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
