import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, CreditCard, ShieldCheck, Loader, Download, BookOpen, ShieldAlert, Mail, Calendar, Hash, Info, Bell, ChevronRight } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '../constants';

import useInactivityTimer from '../hooks/useInactivityTimer';
import Modal from '../components/Modal';

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    useInactivityTimer(240); // Auto-logout after 4 hours (240 minutes) of inactivity

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
                const { data: memberData, error: memberError } = await supabase
                    .from('members')
                    .select('*')
                    .ilike('email', session.user.email)
                    .maybeSingle();

                // Check if user is an admin
                const { data: adminData } = await supabase
                    .from('admins')
                    .select('id')
                    .ilike('email', session.user.email)
                    .maybeSingle();

                setIsAdmin(!!adminData);

                if (memberError) {
                    await supabase.auth.signOut();
                    navigate('/area-do-filiado', { state: { error: `Erro de Segurança (RLS): ${memberError.message}.` } });
                    return;
                }

                if (!memberData) {
                    await supabase.auth.signOut();
                    navigate('/area-do-filiado', { state: { error: `E-mail não encontrado.` } });
                    return;
                }

                if (memberData.status !== 'active') {
                    await supabase.auth.signOut();
                    navigate('/area-do-filiado', { state: { error: 'Conta não ativa.' } });
                    return;
                }

                setMember(memberData);
                
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

    const scrollToDocuments = () => {
        const element = document.getElementById('recent-documents');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    const readIds = JSON.parse(localStorage.getItem('read_announcements') || '[]');
    const unreadCount = MOCK_ANNOUNCEMENTS.filter(ann => !readIds.includes(ann.id)).length;
    const hasUrgent = MOCK_ANNOUNCEMENTS.some(ann => !readIds.includes(ann.id) && (ann.severity === 'important' || ann.severity === 'urgent'));

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Header */}
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
                            <span className="text-sm font-bold text-gray-800">{member?.full_name}</span>
                            <span className="text-xs text-green-600 font-medium">● Ativo</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50">
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Olá, {member?.full_name?.split(' ')[0]}!</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Carteirinha Widget */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-xl shadow-xl p-6 text-white relative overflow-hidden h-56 flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <h3 className="font-bold text-lg">Carteira Digital</h3>
                                    <p className="text-xs text-primary-200">Auditores TCE-PE</p>
                                </div>
                                <ShieldCheck className="text-secondary-400" size={24} />
                            </div>
                            <div className="z-10">
                                <p className="text-sm opacity-80 mb-1">Nome do Associado</p>
                                <p className="font-bold text-lg tracking-wide truncate uppercase">{member?.full_name}</p>
                            </div>
                            <div className="flex justify-between items-end z-10">
                                <div><p className="text-[10px] opacity-70">Matrícula</p><p className="font-mono text-sm">{member?.matricula}</p></div>
                                <div className="text-right"><p className="text-[10px] opacity-70">Validade</p><p className="font-mono text-sm">12/2026</p></div>
                            </div>
                        </div>
                        <button onClick={() => setIsProfileModalOpen(true)} className="w-full mt-4 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group">
                            <User size={16} className="text-primary-600" /> Meus Dados
                        </button>
                    </div>

                    {/* Ações Rápidas com Ajuste no Informativo */}
                    <div className="md:col-span-2">
                        {hasUrgent && (
                            <div onClick={() => navigate('/area-do-filiado/informativos')} className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-colors animate-pulse-subtle">
                                <div className="bg-amber-500 text-white p-2 rounded-lg"><Bell size={20} /></div>
                                <div className="flex-grow">
                                    <p className="text-sm font-bold text-amber-900">Comunicado Importante!</p>
                                    <p className="text-xs text-amber-700">Há novos informativos urgentes para você.</p>
                                </div>
                                <ChevronRight size={20} className="text-amber-400" />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card de Informativo - DIFERENCIADO */}
                            <div
                                onClick={() => navigate('/area-do-filiado/informativos')}
                                className="bg-indigo-50/50 p-6 rounded-xl shadow-sm border-2 border-indigo-100 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                {unreadCount > 0 && (
                                    <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {unreadCount} NOVO{unreadCount > 1 ? 'S' : ''}
                                    </span>
                                )}
                                <div className="bg-white p-3 rounded-full text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                    <Bell size={24} />
                                </div>
                                <h3 className="font-bold text-indigo-900">Informativos</h3>
                                <p className="text-xs text-indigo-600/70 mb-3 font-medium">Comunicados e notícias exclusivas</p>
                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Abrir Mural</span>
                            </div>

                            <div onClick={() => navigate('/area-do-filiado/financeiro')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow group">
                                <div className="bg-green-100 p-3 rounded-full text-green-600 mb-3 group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
                                <h3 className="font-bold text-gray-800">Prestação de Contas</h3>
                                <p className="text-xs text-gray-500 mb-3">Transparência financeira e orçamentária</p>
                                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Acessar</span>
                            </div>

                            <div onClick={scrollToDocuments} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow group">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                                <h3 className="font-bold text-gray-800">Documentos</h3>
                                <p className="text-xs text-gray-500 mb-3">Atas e arquivos institucionais</p>
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Ver Lista</span>
                            </div>

                            <div onClick={() => navigate('/area-do-filiado/analise-tecnica')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-shadow group">
                                <div className="bg-primary-100 p-3 rounded-full text-primary-600 mb-3 group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
                                <h3 className="font-bold text-gray-800">Análise Técnica</h3>
                                <p className="text-xs text-gray-500 mb-3">Notas e pareceres técnicos</p>
                                <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Ler Notas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área de Documentos Recentes */}
                <h2 id="recent-documents" className="text-xl font-bold text-slate-900 mb-4 mt-8">Documentos Recentes</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {documents.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded text-white ${doc.category === 'Financeiro' ? 'bg-green-500' : 'bg-primary-500'}`}><FileText size={20} /></div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{doc.title}</p>
                                            <p className="text-xs text-gray-500">{doc.category} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors"><Download size={18} /></a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 italic">Nenhum documento recente encontrado.</div>
                    )}
                    {isAdmin && (
                        <div className="p-4 bg-primary-50 text-center border-t border-primary-100">
                            <button onClick={() => navigate('/admin/documentos')} className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center justify-center gap-2 mx-auto uppercase tracking-widest">
                                <ShieldAlert size={16} /> Painel Administrador
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Profile Modal */}
            <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Meus Dados">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="bg-primary-600 text-white p-3 rounded-full"><User size={24} /></div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg uppercase">{member?.full_name}</h4>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ativo desde {new Date(member?.created_at).getFullYear()}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-white border border-slate-100 rounded-lg">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Matrícula</p>
                            <p className="font-mono text-slate-800 font-bold">{member?.matricula}</p>
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-lg">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">{member?.status}</span>
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-lg sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail</p>
                            <p className="text-slate-800 font-medium">{member?.email}</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MemberDashboard;
