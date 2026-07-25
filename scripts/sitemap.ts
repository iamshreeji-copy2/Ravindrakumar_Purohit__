import fg from 'fast-glob'
import fs from 'fs-extra'

const DOMAIN = 'https://ravindrakumarpurohit.xyz'

async function run() {
  const pages = [
    '/',
    '/talks',
    '/experience',
    '/projects',
    '/posts',
    '/use',
  ]

  // Add blog posts
  const postsFiles = await fg('pages/posts/*.md')
  for (const file of postsFiles) {
    if (file.includes('index')) continue
    const route = file.replace(/^pages(.+)\.md$/, '$1')
    pages.push(route)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${DOMAIN}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : page.startsWith('/posts/') ? '0.6' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

  await fs.writeFile('./dist/sitemap.xml', sitemap, 'utf-8')
  console.log('Generated dist/sitemap.xml successfully!')
}

run()
