const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
    { id: 'DYkS4kQlmi8', url: 'https://www.instagram.com/p/DYkS4kQlmi8/embed/captioned/' },
    { id: 'DVn_xmEjSvK', url: 'https://www.instagram.com/p/DVn_xmEjSvK/embed/captioned/' },
    { id: 'DVcN6wmj2Ev', url: 'https://www.instagram.com/p/DVcN6wmj2Ev/embed/captioned/' },
    { id: 'DVJI4kgDTAk', url: 'https://www.instagram.com/p/DVJI4kgDTAk/embed/captioned/' },
    { id: 'DU-u5U3Ec9i', url: 'https://www.instagram.com/p/DU-u5U3Ec9i/embed/captioned/' }
];

async function fetchImage(post) {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
    };

    return new Promise((resolve, reject) => {
        https.get(post.url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /class="EmbeddedMediaImage"[\s\S]*?src="([^"]+)"/;
                const match = data.match(regex);
                if (match && match[1]) {
                    const imgUrl = match[1].replace(/&amp;/g, '&');

                    https.get(imgUrl, options, (imgRes) => {
                        const filePath = path.join(__dirname, 'public', 'social', `${post.id}.png`);
                        const fileStream = fs.createWriteStream(filePath);
                        imgRes.pipe(fileStream);
                        fileStream.on('finish', () => {
                            console.log(`Downloaded image for ${post.id}`);
                            resolve();
                        });
                    }).on('error', reject);
                } else {
                    // Fallback to searching for any jpg image in the source if EmbeddedMediaImage is not found
                    const fallbackRegex = /"display_url":"([^"]+)"/;
                    const fallbackMatch = data.match(fallbackRegex);
                    if (fallbackMatch && fallbackMatch[1]) {
                        const imgUrl = fallbackMatch[1].replace(/\\u0026/g, '&');
                        https.get(imgUrl, options, (imgRes) => {
                            const filePath = path.join(__dirname, 'public', 'social', `${post.id}.png`);
                            const fileStream = fs.createWriteStream(filePath);
                            imgRes.pipe(fileStream);
                            fileStream.on('finish', () => {
                                console.log(`Downloaded image for ${post.id}`);
                                resolve();
                            });
                        }).on('error', reject);
                    } else {
                        console.log(`Could not find image for ${post.id}`);
                        fs.writeFileSync(`debug_${post.id}.html`, data); // Save for debug
                        resolve();
                    }
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    for (const post of urls) {
        await fetchImage(post);
    }
}

main();
