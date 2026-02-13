import React from 'react';
import { FileText, Download, Search, Book } from 'lucide-react';

const Publications: React.FC = () => {
    // Mock data for publications (PDFs, Books, Reports)
    const publications = [
        {
            id: 1,
            title: "Relatório de Gestão 2025",
            type: "Relatório",
            date: "2026-01-15",
            size: "2.5 MB",
            cover: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300"
        },
        {
            id: 2,
            title: "Cartilha: O Papel do Auditor de Controle Externo",
            type: "Educativo",
            date: "2025-11-20",
            size: "1.8 MB",
            cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300"
        },
        {
            id: 3,
            title: "Análise Técnica da LRF - Versão Comentada",
            type: "Livro",
            date: "2025-08-10",
            size: "15 MB",
            cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                            <Book size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Publicações</h1>
                            <p className="text-gray-600">Biblioteca digital de relatórios, cartilhas e livros.</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar publicação..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {publications.map((pub) => (
                        <div key={pub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img
                                    src={pub.cover}
                                    alt={pub.title}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-md">
                                        {pub.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-800 mb-2 leading-tight min-h-[40px]">{pub.title}</h3>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>{new Date(pub.date).toLocaleDateString()}</span>
                                    <span>{pub.size}</span>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-bold py-2 rounded-lg transition-colors border border-transparent hover:border-primary-200">
                                    <Download size={16} /> Baixar PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Publications;
