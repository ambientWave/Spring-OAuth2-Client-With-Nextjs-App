import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/private/',
            },
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot'],
                allow: '/',
            },
        ],
        sitemap: 'https://medigize.com/sitemap.xml',
    };
}
