import fs from 'fs';

const filePath = "C:\\Users\\lucas\\Desktop\\Site da Associação\\Site Antigo\\associaodosauditoresdotce-pe.WordPress.2026-03-04.xml";
const outputPath = "C:\\Users\\lucas\\Desktop\\Site da Associação\\auditores-tce-pe\\src\\old_news.ts";

// Helper to escape strings for TS
function escapeContent(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const items = content.split('<item>');

    let newsItems = [];

    for (let i = 1; i < items.length; i++) {
        const item = items[i];

        const postTypeMatch = item.match(/<wp:post_type>.*?<!\[CDATA\[(.*?)\]\].*?<\/wp:post_type>/s) || item.match(/<wp:post_type>(.*?)<\/wp:post_type>/s);
        let postType = postTypeMatch ? postTypeMatch[1].trim() : 'unknown';

        if (postType === 'post') {
            const titleMatch = item.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : 'Sem título';

            const contentMatch = item.match(/<content:encoded><!\[CDATA\[(.*?)\]\]><\/content:encoded>/s);
            let postContent = contentMatch ? contentMatch[1] : '';
            // Convert line breaks to <p> tags roughly for simplicity, or just preserve as is if it's already HTML
            // WP content often lacks paragraph tags.
            postContent = postContent.split(/\r?\n\r?\n/).map(p => `<p class="mb-4">${p.replace(/\r?\n/g, '<br/>')}</p>`).join('');

            const dateMatch = item.match(/<wp:post_date>.*?<!\[CDATA\[(.*?)\]\].*?<\/wp:post_date>/s) || item.match(/<wp:post_date>(.*?)<\/wp:post_date>/s);
            let date = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
            // Get just the YYYY-MM-DD part
            if (date.includes(' ')) {
                date = date.split(' ')[0];
            }

            // Try to extract an image from content
            let imageUrl = '/news/placeholder.jpg'; // default
            const imgMatch = postContent.match(/<img.*?src=["'](.*?)["']/);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }

            // Create a safe ID
            const id = `wp-post-${i}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 50);

            newsItems.push(`
  {
    id: '${id}',
    title: \`${escapeContent(title)}\`,
    summary: \`${escapeContent(title)}\`, // Using title as summary for old posts
    content: \`${escapeContent(postContent)}\`,
    date: '${date}',
    imageUrl: '${imageUrl}',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: false,
    author: 'Arquivo Associação'
  }`);
        }
    }

    const tsContent = `import { NewsCategory, NewsItem } from '../types';

export const OLD_NEWS: NewsItem[] = [${newsItems.join(',\n')}
];
`;

    // Ensure src directory exists
    const srcDir = "C:\\Users\\lucas\\Desktop\\Site da Associação\\auditores-tce-pe\\src";
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir);
    }

    fs.writeFileSync(outputPath, tsContent);
    console.log(`Successfully extracted ${newsItems.length} posts to ${outputPath}`);

} catch (error) {
    console.error("Error parsing XML:", error);
}
