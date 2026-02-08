import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { MOCK_ARTICLES } from '../constants';

const TechnicalAnalysisList: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <div className="bg-primary-900 text-white py-16">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-serif">Análise Técnica</h1>
                    <p className="text-lg text-primary-200 max-w-2xl mx-auto font-light">
                        Estudos, notas técnicas e pareceres jurídicos elaborados pela associação para fortalecer o controle externo.
                    </p>
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto py-12 px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_ARTICLES.map((article) => (
                        <Link
                            to={article.link}
                            key={article.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-primary-900 uppercase tracking-wide">
                                    Nota Técnica
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(article.date).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        <span className="truncate max-w-[120px]">{article.author}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-secondary-600 transition-colors">
                                    {article.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                                    {article.summary}
                                </p>

                                <div className="flex items-center text-primary-700 font-bold text-sm bg-primary-50 p-3 rounded-lg group-hover:bg-primary-100 transition-colors">
                                    Ler Análise Completa <ArrowRight size={16} className="ml-auto" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {MOCK_ARTICLES.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">Nenhuma análise publicada ainda.</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TechnicalAnalysisList;
