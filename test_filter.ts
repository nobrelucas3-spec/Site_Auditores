import { OLD_NEWS } from './old_news.ts';
import { MOCK_NEWS } from './constants.ts';

const ALL_NEWS = [...MOCK_NEWS, ...OLD_NEWS];

try {
    const filteredNews = ALL_NEWS.filter(news => {
        const matchesCategory = true;
        const matchesSearch = news.title.toLowerCase().includes('a') ||
            news.summary.toLowerCase().includes('a');
        return matchesCategory && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log("Success! Items:", filteredNews.length);
} catch (e) {
    console.error("Error filtering:", e);
}
