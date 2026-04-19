import React from 'react';
import { FileText, Book } from 'lucide-react';

const Publications: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                        <Book size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Publicações</h1>
                        <p className="text-gray-600">Biblioteca digital de relatórios, cartilhas e livros.</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2 h-64 md:h-auto relative">
                            <img
                                src="/placeholders/publications_coming_soon.png"
                                alt="Publicações em Produção"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-primary-900/10"></div>
                        </div>

                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold w-fit mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                Biblioteca Digital
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                                Nosso acervo técnico está sendo digitalizado
                            </h2>

                            <p className="text-gray-600 leading-relaxed mb-8">
                                Estamos reunindo cartilhas, relatórios de gestão e publicações técnicas para facilitar o seu acesso à informação. Em breve, todos os documentos estarão disponíveis para download aqui.
                            </p>

                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                        <FileText size={14} />
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center">
                                        <FileText size={14} />
                                    </div>
                                </div>
                                <span className="text-sm font-medium italic">Aguarde novidades...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Publications;
