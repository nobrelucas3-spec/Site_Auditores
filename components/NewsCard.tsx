import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
  layout?: 'grid' | 'list';
}

const NewsCard: React.FC<NewsCardProps> = ({ news, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <div className="flex flex-col md:flex-row gap-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
        <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto shrink-0 overflow-hidden rounded-md">
           <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
          />
        </div>
        <div className="flex flex-col justify-center">
           <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1 text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded">
               <Tag size={12} /> {news.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {new Date(news.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <Link to={`/news/${news.id}`}>
            <h3 className="text-xl font-bold text-slate-800 mb-2 hover:text-primary-700 transition-colors line-clamp-2">
              {news.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {news.summary}
          </p>
          <Link to={`/news/${news.id}`} className="text-primary-600 font-semibold text-sm hover:underline mt-auto">
            Ler notícia completa &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full overflow-hidden group">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={news.imageUrl} 
          alt={news.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4">
           <span className="bg-secondary-500 text-primary-900 text-xs font-bold px-2 py-1 rounded shadow">
             {news.category}
           </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
          <Calendar size={12} />
          {new Date(news.date).toLocaleDateString('pt-BR')}
        </div>
        <Link to={`/news/${news.id}`}>
          <h3 className="text-lg font-bold text-slate-800 mb-3 hover:text-primary-700 transition-colors line-clamp-2">
            {news.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
          {news.summary}
        </p>
        <Link to={`/news/${news.id}`} className="text-primary-600 font-semibold text-sm hover:underline mt-auto">
          Ler mais &rarr;
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
