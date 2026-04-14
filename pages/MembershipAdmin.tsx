import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
    Users, 
    CheckCircle, 
    XCircle, 
    Clock, 
    ExternalLink, 
    ShieldCheck, 
    Loader2, 
    AlertCircle,
    Search,
    Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Application {
    id: string;
    full_name: string;
    email_institutional: string;
    email_personal: string;
    matricula: string;
    affiliation_type: string;
    status: string;
    created_at: string;
}

const MembershipAdmin: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'Pendente' | 'Aprovado' | 'Rejeitado' | 'Todos'>('Pendente');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('membership_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setApplications(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Erro ao carregar solicitações.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (app: Application) => {
        if (!window.confirm(`Deseja aprovar a filiação de ${app.full_name}?`)) return;

        setProcessingId(app.id);
        setError(null);

        try {
            // 1. Map affiliation flags
            const isAssociado = app.affiliation_type === 'Associação' || app.affiliation_type === 'Ambos';
            const isFiliado = app.affiliation_type === 'Sindicato' || app.affiliation_type === 'Ambos';
            const email = app.email_institutional || app.email_personal;

            // 2. Insert into members table
            const { error: memberError } = await supabase
                .from('members')
                .insert([{
                    full_name: app.full_name,
                    email: email,
                    matricula: app.matricula,
                    status: 'active',
                    is_associado: isAssociado,
                    is_filiado: isFiliado,
                    joined_at: new Date().toISOString()
                }]);

            if (memberError) {
                // Check if already exists
                if (memberError.code === '23505') {
                    throw new Error('Este usuário (E-mail ou Matrícula) já consta na base de membros.');
                }
                throw memberError;
            }

            // 3. Update application status
            const { error: updateError } = await supabase
                .from('membership_applications')
                .update({ status: 'Aprovado' })
                .eq('id', app.id);

            if (updateError) throw updateError;

            // 4. Update local state
            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Aprovado' } : a));
            alert('Filiação aprovada com sucesso! O auditor agora pode acessar a área restrita.');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao aprovar filiação.');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.matricula.includes(searchTerm);
        const matchesStatus = filterStatus === 'Todos' || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <ShieldCheck className="text-primary-600" size={32} />
                            Gestão de Filiações
                        </h1>
                        <p className="text-gray-500 mt-1">Revise e aprove novos associados para o site.</p>
                    </div>
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 flex items-center">
                        <button 
                            onClick={() => setFilterStatus('Pendente')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'Pendente' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Pendentes
                        </button>
                        <button 
                            onClick={() => setFilterStatus('Aprovado')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'Aprovado' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Aprovados
                        </button>
                        <button 
                            onClick={() => setFilterStatus('Todos')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'Todos' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Todos
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou matrícula..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={fetchApplications}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                        <Clock size={18} /> Atualizar Lista
                    </button>
                </div>

                {/* Main Content */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p>Carregando solicitações...</p>
                        </div>
                    ) : filteredApps.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidato</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dados</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Adesão</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-800">{app.full_name}</div>
                                                <div className="text-xs text-gray-500">Matrícula: {app.matricula}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-600 truncate max-w-xs">{app.email_institutional || app.email_personal}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    app.affiliation_type === 'Ambos' ? 'bg-secondary-100 text-secondary-800' : 
                                                    app.affiliation_type === 'Associação' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {app.affiliation_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                                                <Link 
                                                    to={`/filiados/ficha/${app.id}`} 
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-bold"
                                                >
                                                    Ficha <ExternalLink size={14} />
                                                </Link>
                                                
                                                {app.status === 'Pendente' && (
                                                    <button 
                                                        onClick={() => handleApprove(app)}
                                                        disabled={processingId === app.id}
                                                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                                                    >
                                                        {processingId === app.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        Aprovar
                                                    </button>
                                                )}
                                                
                                                {app.status === 'Aprovado' && (
                                                    <span className="text-green-600 font-bold flex items-center justify-end gap-1">
                                                        <CheckCircle size={16} /> Aprovado
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhuma solicitação encontrada para o filtro selecionado.</p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">Dica de Segurança:</p>
                        <p>Ao aprovar uma filiação, o sistema cria automaticamente um perfil na tabela de membros ativos. O auditor precisa usar a página de "Primeiro Acesso" para criar sua senha definitiva antes de conseguir logar.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipAdmin;
