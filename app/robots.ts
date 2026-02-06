import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://stayon.online';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/auth/', '/api/revalidate/']
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/dashboard/', '/auth/', '/api/revalidate/']
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/dashboard/', '/auth/', '/api/revalidate/']
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
