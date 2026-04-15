import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    Users, 
    CheckCircle, 
    ExternalLink, 
    Loader2, 
    AlertCircle,
    Search,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Application {
    id: string;
    full_name: string;
    email_institutional: string;
    email_personal: string;
    matricula: string;
    affiliation_type: string;
    is_retired: boolean;
    status: string;
    created_at: string;
}

const ApplicationsTab: React.FC = () => {
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
            const isAssociado = app.affiliation_type === 'Associação' || app.affiliation_type === 'Ambos';
            const isFiliado = app.affiliation_type === 'Sindicato' || app.affiliation_type === 'Ambos';
            const email = app.email_institutional || app.email_personal;

            // 1. Insert into members
            const { error: memberError } = await supabase
                .from('members')
                .insert([{
                    full_name: app.full_name,
                    email: email, // O e-mail principal (de login) escolhido
                    email_institutional: app.email_institutional,
                    email_personal: app.email_personal,
                    matricula: app.matricula,
                    is_retired: app.is_retired,
                    status: 'active',
                    is_associado: isAssociado,
                    is_filiado: isFiliado,
                    created_at: new Date().toISOString()
                }]);

            if (memberError) {
                if (memberError.code === '23505') throw new Error('Este usuário já consta na base de membros.');
                throw memberError;
            }

            // 2. Update application
            await supabase.from('membership_applications').update({ status: 'Aprovado' }).eq('id', app.id);

            // 3. Enviar E-mail de Boas-vindas/Aprovação
            try {
                const firstAccessLink = `${window.location.origin}${window.location.pathname}#/primeiro-acesso`;
                const emailBody = {
                    _subject: 'Boas-vindas! Sua filiação foi aprovada - Auditores TCE-PE',
                    _template: 'table',
                    _captcha: 'false',
                    _language: 'pt',
                    Mensagem: `Olá ${app.full_name}, sua solicitação de filiação foi aprovada pela diretoria! Agora você já pode criar seu acesso ao portal exclusivo.`,
                    Link_para_Primeiro_Acesso: firstAccessLink,
                    Observacao: 'Utilize o e-mail cadastrado e sua matrícula para validar seu primeiro acesso.'
                };

                await fetch(`https://formsubmit.co/ajax/${email}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(emailBody)
                });
            } catch (emailErr) {
                console.warn('Membro aprovado, mas falha ao enviar e-mail de boas-vindas:', emailErr);
            }

            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Aprovado' } : a));
            alert('Aprovado com sucesso! O associado receberá um e-mail com as instruções de acesso.');
        } catch (err: any) {
            setError(err.message || 'Erro ao aprovar.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (app: Application) => {
        if (!window.confirm(`Tem certeza que deseja REJEITAR a filiação de ${app.full_name}?`)) return;

        setProcessingId(app.id);
        setError(null);

        try {
            // 1. Update application status
            const { error: updateError } = await supabase
                .from('membership_applications')
                .update({ status: 'Rejeitado' })
                .eq('id', app.id);

            if (updateError) throw updateError;

            // 2. Enviar E-mail de Notificação de Rejeição (Opcional, mas recomendado)
            try {
                const email = app.email_institutional || app.email_personal;
                const emailBody = {
                    _subject: 'Atualização sobre sua solicitação de filiação - Auditores TCE-PE',
                    _template: 'table',
                    _captcha: 'false',
                    _language: 'pt',
                    Mensagem: `Olá ${app.full_name}, agradecemos seu interesse. No momento, sua solicitação de filiação não pôde ser aprovada seguindo os critérios internos da associação.`,
                    Observacao: 'Caso acredite que houve um equívoco ou queira fornecer dados adicionais, sinta-se à vontade para entrar em contato conosco.'
                };

                await fetch(`https://formsubmit.co/ajax/${email}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(emailBody)
                });
            } catch (emailErr) {
                console.warn('Solicitação rejeitada, mas falha ao enviar e-mail de aviso:', emailErr);
            }

            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Rejeitado' } : a));
            alert('Solicitação rejeitada com sucesso.');
        } catch (err: any) {
            setError(err.message || 'Erro ao rejeitar.');
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar solicitações..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['Pendente', 'Aprovado', 'Rejeitado', 'Todos'] as const).map(s => (
                        <button 
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === s ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2"><AlertCircle size={20}/>{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40}/></div>
                ) : filteredApps.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nome / Matrícula</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Adesão</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {filteredApps.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{app.full_name}</div>
                                        <div className="text-xs text-gray-500">{app.matricula}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{app.email_institutional || app.email_personal}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">{app.affiliation_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <Link to={`/filiados/ficha/${app.id}`} target="_blank" className="text-primary-600 hover:underline inline-flex items-center gap-1 font-bold">Ficha <ExternalLink size={12}/></Link>
                                        {app.status === 'Pendente' && (
                                            <>
                                                <button 
                                                    onClick={() => handleReject(app)}
                                                    disabled={!!processingId}
                                                    className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1"
                                                >
                                                    Rejeitar
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(app)}
                                                    disabled={!!processingId}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {processingId === app.id ? <Loader2 size={12} className="animate-spin" /> : 'Aprovar'}
                                                </button>
                                            </>
                                        )}
                                        {app.status === 'Aprovado' && <span className="text-green-600 font-bold text-xs">✓ Aprovado</span>}
                                        {app.status === 'Rejeitado' && <span className="text-red-600 font-bold text-xs">✕ Rejeitado</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-20 text-center text-gray-400">Nenhuma solicitação encontrada.</div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsTab;
