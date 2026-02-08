import React, { useState, useMemo } from 'react';
import NewsCard from '../components/NewsCard';
import { MOCK_NEWS } from '../constants';
import { NewsCategory, NewsItem } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';

const News: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'Todas'>('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categories = ['Todas', ...Object.values(NewsCategory)];

  // Filter Logic
  const filteredNews = useMemo(() => {
    return MOCK_NEWS.filter(news => {
      const matchesCategory = selectedCategory === 'Todas' || news.category === selectedCategory;
      const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Pagination Logic
  const paginatedNews = filteredNews.slice(0, currentPage * itemsPerPage);
  const hasMore = paginatedNews.length < filteredNews.length;

  // Highlight Logic (First item of the filtered list is the hero, if on page 1 and no search)
  const heroNews: NewsItem | null = (!searchTerm && selectedCategory === 'Todas' && filteredNews.length > 0) ? filteredNews[0] : null;
  const listNews = heroNews ? filteredNews.slice(1, currentPage * itemsPerPage + 1) : paginatedNews;


  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header Area for News */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Notícias e Comunicados</h1>
          <p className="text-gray-500">Acompanhe as últimas novidades da nossa atuação.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* Main Content Area */}
        <div className="w-full lg:w-3/4">

          {/* Highlight Section (Only visible on default view) */}
          {heroNews && (
            <Link to={`/news/${heroNews.id}`} className="block mb-10 group cursor-pointer">
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={heroNews.imageUrl}
                  alt={heroNews.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <span className="bg-secondary-500 text-primary-900 text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                    Destaque
                  </span>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
                    {heroNews.title}
                  </h2>
                  <p className="text-gray-300 md:text-lg line-clamp-2 max-w-3xl">
                    {heroNews.summary}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* List of other news */}
          <div className="space-y-6">
            {listNews.length > 0 ? (
              listNews.map(news => (
                <NewsCard key={news.id} news={news} layout="list" />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                Nenhuma notícia encontrada para os filtros selecionados.
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="bg-white border border-gray-300 text-slate-700 font-semibold py-3 px-8 rounded-full hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
              >
                Carregar mais notícias
              </button>
            </div>
          )}
        </div>

        {/* Sidebar / Filters */}
        <div className="w-full lg:w-1/4 space-y-8">

          {/* Search Box */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={18} /> Buscar
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Palavra-chave..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Filter size={18} /> Categorias
            </h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category as NewsCategory | 'Todas');
                      setCurrentPage(1); // Reset page on filter change
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === category
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {category}
                    {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (Optional) */}
          <div className="bg-primary-900 text-white p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-2">Newsletter</h3>
            <p className="text-primary-200 text-sm mb-4">Receba nossas atualizações diretamente no seu e-mail.</p>
            <input type="email" placeholder="Seu e-mail" className="w-full px-3 py-2 rounded text-slate-900 text-sm mb-3 outline-none" />
            <button className="w-full bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-2 rounded text-sm transition-colors">
              Inscrever-se
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default News;
