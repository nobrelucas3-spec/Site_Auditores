import fs from 'fs';

let content = fs.readFileSync('old_news.ts', 'utf8');
content = content.replace(/'\/news\/placeholder\.jpg'/g, "'/logo.png'");
fs.writeFileSync('old_news.ts', content);
console.log('Replaced placeholder URLs.');
