import React from 'react';
import { MOCK_ARTICLES } from '../constants';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticlesList: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-secondary-100 rounded-lg text-secondary-600">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Artigos e Opinião</h1>
                        <p className="text-gray-600">Análises técnicas e artigos produzidos pelos auditores.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_ARTICLES.map((article) => (
                        <article key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(article.date).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        {article.author}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">
                                    <Link to={article.link} className="hover:text-primary-600 transition-colors">
                                        {article.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {article.summary}
                                </p>

                                <div className="mt-auto">
                                    <Link
                                        to={article.link}
                                        className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:text-primary-800"
                                    >
                                        Ler Artigo Completo <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* Placeholder for when there are few articles */}
                    {MOCK_ARTICLES.length < 3 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-gray-50 h-full min-h-[400px]">
                            <p className="text-gray-500 font-medium mb-2">Espaço para novos artigos</p>
                            <p className="text-sm text-gray-400">Envie sua contribuição para a diretoria de comunicação.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticlesList;
