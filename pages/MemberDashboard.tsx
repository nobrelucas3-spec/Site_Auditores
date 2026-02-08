import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, CreditCard, ShieldCheck, Loader, Download } from 'lucide-react';

import useInactivityTimer from '../hooks/useInactivityTimer';

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    useInactivityTimer(15); // Auto-logout after 15 minutes

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [documents, setDocuments] = useState<any[]>([]);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/area-do-filiado');
            } else {
                setUser(session.user);

                // Fetch member details
                const { data: memberData } = await supabase
                    .from('members')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (memberData) {
                    setMember(memberData);
                }
                // Fetch recent documents
                const { data: docs } = await supabase
                    .from('documents')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (docs) setDocuments(docs);
            }
            setLoading(false);
        };
        getSession();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/area-do-filiado');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Navbar */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">Área do Filiado</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-sm font-bold text-gray-800">{member?.full_name || user?.email}</span>
                            <span className="text-xs text-green-600 font-medium">● Ativo</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Olá, {member?.full_name?.split(' ')[0] || 'Auditor(a)'}!</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Carteirinha Virtual Widget */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-xl shadow-xl p-6 text-white relative overflow-hidden h-56 flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>

                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <h3 className="font-bold text-lg">Carteira Digital</h3>
                                    <p className="text-xs text-primary-200">Associação dos Auditores</p>
                                </div>
                                <ShieldCheck className="text-secondary-400" size={24} />
                            </div>

                            <div className="z-10">
                                <p className="text-sm opacity-80 mb-1">Nome do Associado</p>
                                <p className="font-bold text-lg tracking-wide truncate uppercase">{member?.full_name || user?.email}</p>
                            </div>

                            <div className="flex justify-between items-end z-10">
                                <div>
                                    <p className="text-[10px] opacity-70">Matrícula</p>
                                    <p className="font-mono text-sm">{member?.matricula || '000.000.000'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-70">Validade</p>
                                    <p className="font-mono text-sm">12/{new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <User size={16} /> Ver Dados Completos
                        </button>
                    </div>

                    {/* Status e Ações Rápidas */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                            onClick={() => navigate('/area-do-filiado/financeiro')}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="bg-green-100 p-3 rounded-full text-green-600 mb-3 group-hover:scale-110 transition-transform">
                                <CreditCard size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800">Prestação de Contas</h3>
                            <p className="text-sm text-gray-500 mb-3">Transparência financeira e orçamentária.</p>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Acessar</span>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800">Documentos</h3>
                            <p className="text-sm text-gray-500 mb-3">3 novos documentos disponíveis.</p>
                            <button className="text-blue-600 text-sm font-bold hover:underline">Acessar Arquivos</button>
                        </div>
                    </div>
                </div>

                {/* Área de Documentos Recentes */}
                <h2 className="text-xl font-bold text-slate-900 mb-4 mt-8">Documentos Recentes</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Carregando documentos...</div>
                    ) : documents.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded text-white ${doc.category === 'Financeiro' ? 'bg-green-500' : 'bg-primary-500'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{doc.title}</p>
                                            <p className="text-xs text-gray-500">{doc.category} • Publicado em {new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                        title="Baixar Arquivo"
                                    >
                                        <Download size={18} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">Nenhum documento recente encontrado.</div>
                    )}

                    <div className="p-3 bg-gray-50 text-center border-t border-gray-200">
                        <button onClick={() => navigate('/admin/documentos')} className="text-xs text-gray-500 hover:text-gray-800 underline">
                            Gerenciar Arquivos (Admin)
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MemberDashboard;
