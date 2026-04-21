import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    FileText, 
    UserCheck, 
    ShieldAlert, 
    ChevronLeft, 
    LogOut,
    LayoutDashboard,
    Loader2,
    DollarSign
} from 'lucide-react';

// Tab Components
import ApplicationsTab from '../components/admin/ApplicationsTab';
import MembersTab from '../components/admin/MembersTab';
import DocumentsTab from '../components/admin/DocumentsTab';
import FinancesTab from '../components/admin/FinancesTab';

const AdminPortal: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'applications' | 'members' | 'documents' | 'finances'>('applications');
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState<any>(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                navigate('/area-do-filiado');
                return;
            }

            // Validação dinâmica via tabela 'admins' com diagnóstico
            try {
                const userEmail = session.user.email;
                console.log('Validando acesso para:', userEmail);

                const { data: adminRecord, error: adminError } = await supabase
                    .from('admins')
                    .select('email')
                    .ilike('email', userEmail || '') // ilike ignora maiúsculas/minúsculas
                    .maybeSingle(); // maybeSingle não dá erro se não encontrar, apenas retorna null
                
                if (adminError) {
                    console.error('Erro na consulta ao banco (RLS?):', adminError);
                    alert('Erro de permissão no banco de dados. Verifique o console (F12).');
                    navigate('/area-do-filiado/dashboard');
                    return;
                }

                if (adminRecord) {
                    console.log('Acesso concedido!');
                    setIsAdmin(true);
                    setAdminUser(session.user);
                } else {
                    console.warn('Acesso negado: E-mail não encontrado na tabela admins.');
                    navigate('/area-do-filiado/dashboard');
                }
            } catch (err) {
                console.error('Erro inesperado na validação:', err);
                navigate('/area-do-filiado/dashboard');
            } finally {
                setLoading(false);
            }
        };

        verifyAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/area-do-filiado');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-500 font-medium">Validando credenciais administrativas...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col fixed inset-y-0">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-500 p-2 rounded-lg">
                            <ShieldAlert size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Portal Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button 
                        onClick={() => setActiveTab('applications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'applications' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <UserCheck size={20} />
                        <span className="font-bold">Solicitações</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('members')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'members' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users size={20} />
                        <span className="font-bold">Gestão de Membros</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('documents')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'documents' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileText size={20} />
                        <span className="font-bold">Arquivos</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('finances')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'finances' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <DollarSign size={20} />
                        <span className="font-bold">Financeiro</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10 space-y-4">
                    <div className="px-4 py-2 bg-white/5 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Logado como</p>
                        <p className="text-xs truncate font-medium text-gray-300">{adminUser.email}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <ChevronLeft size={16} /> Voltar ao Site
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="text-primary-600" size={24} />
                        <span className="font-bold">Admin Portal</span>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => setActiveTab('applications')} className={`p-2 rounded ${activeTab === 'applications' ? 'bg-primary-100 text-primary-700' : 'text-gray-400'}`}><UserCheck size={20}/></button>
                         <button onClick={() => setActiveTab('members')} className={`p-2 rounded ${activeTab === 'members' ? 'bg-primary-100 text-primary-700' : 'text-gray-400'}`}><Users size={20}/></button>
                         <button onClick={() => setActiveTab('documents')} className={`p-2 rounded ${activeTab === 'documents' ? 'bg-primary-100 text-primary-700' : 'text-gray-400'}`}><FileText size={20}/></button>
                         <button onClick={() => setActiveTab('finances')} className={`p-2 rounded ${activeTab === 'finances' ? 'bg-primary-100 text-primary-700' : 'text-gray-400'}`}><DollarSign size={20}/></button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-primary-600 text-sm font-bold mb-2 uppercase tracking-widest">
                            <LayoutDashboard size={14} /> Painel Administrativo
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {activeTab === 'applications' && 'Solicitações de Filiação'}
                            {activeTab === 'members' && 'Gestão de Membros Efetivos'}
                            {activeTab === 'documents' && 'Centro de Documentação'}
                            {activeTab === 'finances' && 'Gestão de Patrimônio e Investimentos'}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {activeTab === 'applications' && 'Analise novos dados e migre auditores para a base oficial de membros.'}
                            {activeTab === 'members' && 'Controle o status e mantenha os dados da categoria atualizados.'}
                            {activeTab === 'documents' && 'Envie arquivos restritos ou públicos para o site.'}
                            {activeTab === 'finances' && 'Atualize saldos de CDBs, LCs e gerencie o portfólio de investimentos fixos.'}
                        </p>
                    </div>

                    {/* Active Content */}
                    <div className="transition-all duration-300">
                        {activeTab === 'applications' && <ApplicationsTab />}
                        {activeTab === 'members' && <MembersTab />}
                        {activeTab === 'documents' && <DocumentsTab />}
                        {activeTab === 'finances' && <FinancesTab />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminPortal;
