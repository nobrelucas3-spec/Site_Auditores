import { OLD_NEWS } from './old_news.ts';

const invalid = OLD_NEWS.filter(n => {
    if (!n.date) return true;
    const d = new Date(n.date);
    return isNaN(d.getTime());
});

console.log('Total old news:', OLD_NEWS.length);
console.log('Invalid dates count:', invalid.length);
if (invalid.length > 0) {
    console.log('Examples of invalid dates:', invalid.map(n => n.date).slice(0, 5));
}
