import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { FileText, Search, Download, Filter, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MemberDocuments: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [categories, setCategories] = useState<string[]>(['Todas']);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching docs:', error);
        } else if (data) {
            setDocuments(data);
            const cats = Array.from(new Set(data.map((d: any) => d.category))).filter(Boolean) as string[];
            setCategories(['Todas', ...cats]);
        }
        setLoading(false);
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todas' || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/area-do-filiado/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} /> <span className="hidden sm:inline">Voltar ao Painel</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 text-white p-1 rounded">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-bold text-slate-800">Repositório de Documentos</span>
                    </div>
                    <div className="w-20 hidden sm:block"></div> {/* Spacer */}
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Documentos e Arquivos</h1>
                    <p className="text-gray-500">Acesse atas, prestações de contas, estatutos e informativos da associação.</p>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar por título ou descrição..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter size={18} className="text-gray-400" />
                        <select 
                            className="flex-grow py-2 px-3 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p>Carregando repositório...</p>
                        </div>
                    ) : filteredDocs.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3 rounded-xl transition-colors ${doc.category === 'Financeiro' ? 'bg-green-100 text-green-600' : 'bg-primary-50 text-primary-600'}`}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-0.5 group-hover:text-primary-700 transition-colors">{doc.title}</h4>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500">
                                                <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">{doc.category}</span>
                                                <span>Ano: {doc.year}</span>
                                                <span>Publicado: {new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {doc.description && <p className="text-sm text-gray-500 mt-2 line-clamp-1">{doc.description}</p>}
                                        </div>
                                    </div>
                                    <a 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 bg-slate-100 text-slate-500 rounded-full hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                        title="Download"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Nenhum documento encontrado</h3>
                            <p className="text-gray-500">Tente ajustar sua busca ou filtro para encontrar o que precisa.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setFilterCategory('Todas'); }}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MemberDocuments;
