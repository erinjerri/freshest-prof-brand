/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin*', '/api/*', '/next/*', '/_not-found'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/next/'],
      },
    ],
  },
  // Static paths only - prevents hanging from trying to crawl dynamic routes
  transform: async (config, path) => {
    // Skip API routes and admin routes
    if (path.startsWith('/api/') || path.startsWith('/admin')) {
      return null
    }

    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    }
  },
  // Only include static routes to prevent crawling issues
  additionalPaths: async (config) => [
    {
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/posts',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    },
    {
      loc: '/search',
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: new Date().toISOString(),
    },
  ],
}
