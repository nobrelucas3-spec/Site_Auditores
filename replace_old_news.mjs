import fs from 'fs';

let content = fs.readFileSync('old_news.ts', 'utf8');
content = content.replace(/NewsCategory\.INSTITUCIONAL/g, 'NewsCategory.ARQUIVO');
fs.writeFileSync('old_news.ts', content);
console.log('Replaced all categories.');
