import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
    ExternalLink,
    Loader2,
    AlertCircle,
    Search,
    ShieldCheck,
    Clock,
    FileCheck2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildFichaFileName, openOrDownloadPdfUrl } from '../../services/fichaPdfService';

interface SignatureMetadata {
    verified?: boolean;
    signerName?: string;
    signerCpfMasked?: string;
    issuer?: string;
    signedAt?: string;
    validatedAt?: string;
}

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
    signed_pdf_url?: string | null;
    signed_pdf_name?: string | null;
    signature_metadata?: SignatureMetadata | null;
    signed_at?: string | null;
}

function mergeLocalSignedCache(rows: Application[]): Application[] {
    return rows.map((app) => {
        if (app.signed_pdf_url) return app;
        try {
            const cached = localStorage.getItem(`ficha_signed_${app.id}`);
            if (cached) {
                return { ...app, ...JSON.parse(cached) };
            }
        } catch {
            // ignore
        }
        return app;
    });
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
            setApplications(mergeLocalSignedCache((data || []) as Application[]));
        } catch (err) {
            console.error('Erro ao buscar solicitações:', err);
            setError('Erro ao carregar solicitações.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (app: Application) => {
        const cleanName = app.full_name.trim();
        const isSigned = Boolean(app.signature_metadata?.verified);

        const confirmMessage = isSigned
            ? `Deseja aprovar a filiação de ${cleanName}? (Assinatura Gov.br verificada)`
            : `Esta solicitação de ${cleanName} ainda não possui o PDF assinado pelo Gov.br anexado no sistema. Deseja aprovar mesmo assim?`;

        if (!window.confirm(confirmMessage)) return;

        setProcessingId(app.id);
        setError(null);

        try {
            const cleanMatricula = (app.matricula || '').trim();
            const cleanEmailInst = (app.email_institutional || '').trim();
            const cleanEmailPers = (app.email_personal || '').trim();
            const primaryEmail = cleanEmailInst || cleanEmailPers;
            const addAssociado = app.affiliation_type === 'Associação' || app.affiliation_type === 'Ambos';
            const addFiliado = app.affiliation_type === 'Sindicato' || app.affiliation_type === 'Ambos';

            // 1. Verificar se o auditor já consta na base oficial de membros (por matrícula ou e-mail)
            let existingMember: any = null;
            if (cleanMatricula) {
                const { data: byMat, error: matErr } = await supabase
                    .from('members')
                    .select('*')
                    .eq('matricula', cleanMatricula)
                    .limit(1);
                if (matErr) throw matErr;
                if (byMat && byMat.length > 0) {
                    existingMember = byMat[0];
                }
            }

            if (!existingMember) {
                const emailFilters: string[] = [];
                if (cleanEmailInst) {
                    emailFilters.push(
                        `email.ilike.${cleanEmailInst}`,
                        `email_institutional.ilike.${cleanEmailInst}`,
                        `email_personal.ilike.${cleanEmailInst}`
                    );
                }
                if (cleanEmailPers) {
                    emailFilters.push(
                        `email.ilike.${cleanEmailPers}`,
                        `email_institutional.ilike.${cleanEmailPers}`,
                        `email_personal.ilike.${cleanEmailPers}`
                    );
                }
                if (emailFilters.length > 0) {
                    const { data: byEmail, error: emailErr } = await supabase
                        .from('members')
                        .select('*')
                        .or(emailFilters.join(','))
                        .limit(1);
                    if (emailErr) throw emailErr;
                    if (byEmail && byEmail.length > 0) {
                        existingMember = byEmail[0];
                    }
                }
            }

            // 2. Atualizar cadastro existente (somando vínculos) ou criar novo membro
            let wasMerged = false;
            if (existingMember) {
                wasMerged = true;
                const mergedAssociado = Boolean(existingMember.is_associado) || addAssociado;
                const mergedFiliado = Boolean(existingMember.is_filiado) || addFiliado;

                const { error: updateMemberError } = await supabase
                    .from('members')
                    .update({
                        full_name: existingMember.full_name?.trim() || cleanName,
                        email: existingMember.email?.trim() || primaryEmail,
                        email_institutional: cleanEmailInst || existingMember.email_institutional || '',
                        email_personal: cleanEmailPers || existingMember.email_personal || '',
                        matricula: cleanMatricula || existingMember.matricula,
                        is_retired: app.is_retired,
                        status: 'active',
                        is_associado: mergedAssociado,
                        is_filiado: mergedFiliado
                    })
                    .eq('id', existingMember.id);

                if (updateMemberError) throw updateMemberError;
            } else {
                const { error: insertMemberError } = await supabase
                    .from('members')
                    .insert([{
                        full_name: cleanName,
                        email: primaryEmail,
                        email_institutional: cleanEmailInst,
                        email_personal: cleanEmailPers,
                        matricula: cleanMatricula,
                        is_retired: app.is_retired,
                        status: 'active',
                        is_associado: addAssociado,
                        is_filiado: addFiliado,
                        created_at: new Date().toISOString()
                    }]);

                if (insertMemberError) throw insertMemberError;
            }

            // 3. Atualizar status da solicitação
            const { error: updateAppError } = await supabase
                .from('membership_applications')
                .update({ status: 'Aprovado' })
                .eq('id', app.id);

            if (updateAppError) throw updateAppError;

            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Aprovado' } : a));
            alert(
                wasMerged
                    ? 'Filiação aprovada! Como o auditor já constava na base de membros, o novo vínculo foi unificado ao cadastro existente sem gerar duplicidade.'
                    : 'Filiação aprovada com sucesso! O associado já foi incluído na tabela de membros ativos e pode realizar o Primeiro Acesso pelo site.'
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao aprovar.';
            setError(message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (app: Application) => {
        if (!window.confirm(`Tem certeza que deseja REJEITAR a filiação de ${app.full_name.trim()}?`)) return;

        setProcessingId(app.id);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('membership_applications')
                .update({ status: 'Rejeitado' })
                .eq('id', app.id);

            if (updateError) throw updateError;

            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Rejeitado' } : a));
            alert('Solicitação rejeitada com sucesso.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao rejeitar.';
            setError(message);
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nome / Matrícula</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">E-mail</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Adesão</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Assinatura Gov.br</th>
                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredApps.map(app => {
                                    const hasVerifiedGovBr = Boolean(app.signature_metadata?.verified && app.signed_pdf_url);
                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{app.full_name}</div>
                                                <div className="text-xs text-gray-500">Mat. {app.matricula}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{app.email_institutional || app.email_personal}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">{app.affiliation_type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasVerifiedGovBr ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                                            <ShieldCheck size={12} /> Gov.br Verificado
                                                        </span>
                                                        <div className="text-[11px] text-gray-500">
                                                            {app.signature_metadata?.signerName}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                                                        <Clock size={12} /> Pendente de assinatura
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                                                {hasVerifiedGovBr && app.signed_pdf_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openOrDownloadPdfUrl(app.signed_pdf_url!, app.signed_pdf_name || buildFichaFileName(app.full_name))}
                                                        className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-bold text-xs"
                                                    >
                                                        <FileCheck2 size={14} /> PDF Assinado
                                                    </button>
                                                )}
                                                <Link to={`/filiados/ficha/${app.id}`} className="text-primary-600 hover:underline inline-flex items-center gap-1 font-bold text-xs">
                                                    Ficha <ExternalLink size={12}/>
                                                </Link>
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
                                                            className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {processingId === app.id ? <Loader2 size={12} className="animate-spin" /> : 'Aprovar'}
                                                        </button>
                                                    </>
                                                )}
                                                {app.status === 'Aprovado' && <span className="text-green-600 font-bold text-xs">✓ Aprovado</span>}
                                                {app.status === 'Rejeitado' && <span className="text-red-600 font-bold text-xs">✕ Rejeitado</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center text-gray-400">Nenhuma solicitação encontrada.</div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsTab;
