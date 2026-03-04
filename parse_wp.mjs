import fs from 'fs';

const filePath = "C:\\Users\\lucas\\Desktop\\Site da Associação\\Site Antigo\\associaodosauditoresdotce-pe.WordPress.2026-03-04.xml";

try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const items = content.split('<item>');
    console.log("Total items:", items.length - 1);

    let postCount = 0;
    let attachmentCount = 0;
    let pageCount = 0;
    let otherCount = 0;

    const samplePosts = [];

    for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const postTypeMatch = item.match(/<wp:post_type>.*?<!\[CDATA\[(.*?)\]\].*?<\/wp:post_type>/s) || item.match(/<wp:post_type>(.*?)<\/wp:post_type>/s);
        let postType = 'unknown';
        if (postTypeMatch) {
            postType = postTypeMatch[1].trim();
        }

        if (postType === 'post') {
            postCount++;
            if (samplePosts.length < 5) {
                const titleMatch = item.match(/<title>(.*?)<\/title>/);
                const title = titleMatch ? titleMatch[1].replace('<![CDATA[', '').replace(']]>', '') : 'No title';

                const dateMatch = item.match(/<wp:post_date>.*?<!\[CDATA\[(.*?)\]\].*?<\/wp:post_date>/s) || item.match(/<wp:post_date>(.*?)<\/wp:post_date>/s);
                const date = dateMatch ? dateMatch[1].trim() : 'No date';

                samplePosts.push(`- ${title} (${date})`);
            }
        } else if (postType === 'attachment') {
            attachmentCount++;
        } else if (postType === 'page') {
            pageCount++;
        } else {
            otherCount++;
        }
    }

    console.log("Posts:", postCount);
    console.log("Pages:", pageCount);
    console.log("Attachments:", attachmentCount);
    console.log("Others:", otherCount);
    console.log("Sample Posts:\n" + samplePosts.join('\n'));
} catch (error) {
    console.error("Error parsing XML:", error);
}
