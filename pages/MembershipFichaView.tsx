import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
    Printer,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Download,
    ExternalLink,
    UploadCloud,
    CheckCircle2,
    ShieldCheck,
    Share2,
    Lock,
    LogOut,
    FileCheck2,
    RefreshCw
} from 'lucide-react';
import {
    FichaPdfData,
    buildFichaFileName,
    generateAndDownloadFichaPdf,
    generateFichaPdfBlob,
    openOrDownloadPdfUrl
} from '../services/fichaPdfService';
import { validateGovBrSignedPdf } from '../services/govBrSignatureValidator';

interface SignatureMetadata {
    verified: boolean;
    signerName: string;
    signerCpfMasked?: string;
    issuer: string;
    signedAt?: string;
    validatedAt?: string;
}

interface MembershipData extends FichaPdfData {
    id?: string;
    status?: string;
    signed_pdf_url?: string | null;
    signed_pdf_name?: string | null;
    signature_metadata?: SignatureMetadata | null;
    signed_at?: string | null;
}

interface LocationState {
    verifiedCpf?: string;
    verifiedMatricula?: string;
}

function purgeLegacyLocalStorageData() {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('last_membership_app');
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('ficha_data_') || key.startsWith('ficha_signed_')) {
                localStorage.removeItem(key);
            }
        });
    } catch {
        // ignore
    }
}

const MembershipFichaView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [data, setData] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [verifiedCreds, setVerifiedCreds] = useState<{ cpf: string; matricula: string } | null>(null);

    // Gate de credenciais (CPF + Matrícula) quando acessado diretamente pelo link
    const [gateCpf, setGateCpf] = useState('');
    const [gateMatricula, setGateMatricula] = useState('');
    const [gateLoading, setGateLoading] = useState(false);
    const [gateError, setGateError] = useState<string | null>(null);

    const [pdfLoading, setPdfLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
    const [showReplaceUpload, setShowReplaceUpload] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const loadFichaWithAuth = async (
        targetId: string,
        cpfDigits: string,
        matriculaStr: string,
        adminMode: boolean
    ): Promise<MembershipData | null> => {
        // 1. Tentar RPC segura de 3 parâmetros (exige sessão Admin OU CPF + Matrícula)
        const { data: rpc3Data, error: rpc3Error } = await supabase.rpc('get_membership_application_by_id', {
            p_id: targetId,
            p_cpf: adminMode ? null : cpfDigits,
            p_matricula: adminMode ? null : matriculaStr
        });

        if (!rpc3Error) {
            return (rpc3Data as MembershipData | null) || null;
        }

        // 2. Se for Admin e houver erro de assinatura antiga, pode ler direto (protegido por RLS is_admin())
        if (adminMode) {
            const { data: adminDirect, error: adminDirectErr } = await supabase
                .from('membership_applications')
                .select('*')
                .eq('id', targetId)
                .single();

            if (!adminDirectErr && adminDirect) {
                return adminDirect as MembershipData;
            }
        }

        // 3. Fallback caso a RPC de 1 argumento antiga ainda esteja no banco antes da migração
        const isMissingSignatureError =
            rpc3Error.code === 'PGRST202' ||
            (rpc3Error.message || '').toLowerCase().includes('get_membership_application_by_id');

        if (isMissingSignatureError) {
            const { data: rpc1Data, error: rpc1Error } = await supabase.rpc('get_membership_application_by_id', {
                p_id: targetId
            });

            if (!rpc1Error && rpc1Data) {
                const candidate = rpc1Data as MembershipData;
                if (adminMode) return candidate;

                const candidateCpf = String(candidate.cpf || '').replace(/\D/g, '');
                const candidateMat = String(candidate.matricula || '').trim();
                if (cpfDigits.length === 11 && candidateCpf === cpfDigits && candidateMat === matriculaStr) {
                    return candidate;
                }
                return null;
            }
        }

        return null;
    };

    useEffect(() => {
        purgeLegacyLocalStorageData();

        const initAccess = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                // 1. Verificar se há sessão administrativa ativa
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    const { data: adminRec } = await supabase
                        .from('admins')
                        .select('email')
                        .ilike('email', session.user.email)
                        .maybeSingle();

                    if (adminRec) {
                        const loaded = await loadFichaWithAuth(id, '', '', true);
                        if (!loaded) {
                            setError('Ficha de filiação não localizada.');
                        } else {
                            setIsAdmin(true);
                            setData(loaded);
                        }
                        setLoading(false);
                        return;
                    }
                }

                // 2. Verificar se veio autenticado na memória a partir de /associe-se (cadastro ou consulta)
                const navState = location.state as LocationState | null;
                const stateCpf = (navState?.verifiedCpf || '').replace(/\D/g, '');
                const stateMat = (navState?.verifiedMatricula || '').trim();

                if (stateCpf.length === 11 && stateMat) {
                    const loaded = await loadFichaWithAuth(id, stateCpf, stateMat, false);
                    if (loaded) {
                        setVerifiedCreds({ cpf: stateCpf, matricula: stateMat });
                        setData(loaded);
                        // Limpar history.state para exigir nova confirmação em caso de recarregamento futuro
                        navigate(location.pathname, { replace: true, state: null });
                        setLoading(false);
                        return;
                    }
                }

                // 3. Sem credencial: permanecer na barreira de autenticação (não carrega dados)
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Não foi possível validar o acesso à ficha.');
                setLoading(false);
            }
        };

        initAccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleVerifyCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const cpfDigits = gateCpf.replace(/\D/g, '');
        const cleanMat = gateMatricula.trim();

        if (cpfDigits.length !== 11 || !cleanMat) {
            setGateError('Informe seu CPF completo (11 dígitos) e sua matrícula do TCE-PE.');
            return;
        }

        setGateLoading(true);
        setGateError(null);

        try {
            const loaded = await loadFichaWithAuth(id, cpfDigits, cleanMat, false);
            if (!loaded) {
                setGateError('Credenciais inválidas ou ficha não localizada. Confira o CPF e a matrícula informados.');
                return;
            }
            setVerifiedCreds({ cpf: cpfDigits, matricula: cleanMat });
            setData(loaded);
        } catch (err) {
            console.error(err);
            setGateError('Erro ao verificar credenciais. Tente novamente.');
        } finally {
            setGateLoading(false);
        }
    };

    const handleExitSession = () => {
        setData(null);
        setVerifiedCreds(null);
        if (isAdmin) {
            navigate('/admin');
        } else {
            navigate('/associe-se');
        }
    };

    const handlePrint = () => window.print();

    const handleDownloadPdf = async () => {
        if (!data || !id) return;
        setPdfLoading(true);
        try {
            await generateAndDownloadFichaPdf(data, id);
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Não foi possível gerar o PDF automaticamente. Use o botão "Imprimir na Tela" e selecione "Salvar como PDF".');
        } finally {
            setPdfLoading(false);
        }
    };

    const handleSharePdf = async () => {
        if (!data || !id) return;
        setShareLoading(true);
        try {
            const blob = await generateFichaPdfBlob(data, id);
            const fileName = buildFichaFileName(data.full_name);
            const file = new File([blob], fileName, { type: 'application/pdf' });

            if (typeof navigator !== 'undefined' && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
                await navigator.share({
                    title: 'Formulário de Admissão - Auditores TCE-PE',
                    text: 'Formulário de Admissão pronto para assinatura digital no Gov.br.',
                    files: [file]
                });
            } else {
                await generateAndDownloadFichaPdf(data, id);
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                await handleDownloadPdf();
            }
        } finally {
            setShareLoading(false);
        }
    };

    const handleSignedFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !data || !id) return;

        // Trava extra: requer sessão Admin ou credenciais verificadas
        if (!isAdmin && (!verifiedCreds || verifiedCreds.cpf.length !== 11 || !verifiedCreds.matricula)) {
            setUploadError('Sessão não autenticada. Informe seu CPF e matrícula para enviar documentos.');
            return;
        }

        // Impede substituição por não-admins após validação ou aprovação
        const alreadyVerified = Boolean(data.signed_pdf_url && data.signature_metadata?.verified);
        if (!isAdmin && (alreadyVerified || (data.status && data.status !== 'Pendente'))) {
            setUploadError('Esta solicitação já possui documento validado ou já foi analisada pela Diretoria.');
            return;
        }

        setUploading(true);
        setUploadError(null);
        setUploadSuccessMsg(null);
        setUploadStatusMsg('Validando assinatura digital Gov.br e titularidade...');

        try {
            const validation = await validateGovBrSignedPdf(file, data.full_name, data.cpf);
            if (!validation.valid) {
                setUploadError(validation.error || 'Documento recusado na validação de assinatura digital.');
                setUploadStatusMsg(null);
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            const sigMeta: SignatureMetadata = {
                verified: true,
                signerName: validation.signerName || data.full_name.trim(),
                signerCpfMasked: validation.signerCpfMasked,
                issuer: validation.issuer || 'Gov.br / ICP-Brasil',
                signedAt: validation.signedAt,
                validatedAt: new Date().toISOString()
            };

            setUploadStatusMsg('Assinatura confirmada! Gravando documento com segurança...');

            const randSuffix =
                typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const safePath = `ficha-${id}-${randSuffix}.pdf`;

            const { error: storageError } = await supabase.storage
                .from('signed-fichas')
                .upload(safePath, file, {
                    contentType: 'application/pdf',
                    upsert: false
                });

            if (storageError) {
                throw new Error(
                    storageError.message.toLowerCase().includes('bucket')
                        ? 'O repositório de fichas assinadas ainda não foi criado no Supabase. Execute o script supabase_filiacao_online_govbr.sql no SQL Editor do Supabase.'
                        : `Erro ao enviar PDF: ${storageError.message}`
                );
            }

            const { data: pub } = supabase.storage.from('signed-fichas').getPublicUrl(safePath);
            const finalPdfUrl = pub.publicUrl;

            const { data: rpcUpdated, error: rpcError } = await supabase.rpc('submit_signed_membership_ficha', {
                p_id: id,
                p_cpf: isAdmin ? '' : verifiedCreds?.cpf || '',
                p_matricula: isAdmin ? '' : verifiedCreds?.matricula || '',
                p_signed_pdf_url: finalPdfUrl,
                p_signed_pdf_name: file.name,
                p_signature_metadata: sigMeta
            });

            if (rpcError) {
                throw new Error(
                    rpcError.code === 'PGRST202'
                        ? 'A função de envio seguro ainda não foi criada no Supabase. Execute o script supabase_filiacao_online_govbr.sql no SQL Editor.'
                        : rpcError.message
                );
            }

            const updatedRecord = rpcUpdated as MembershipData;
            setData((prev) => (prev ? { ...prev, ...updatedRecord } : updatedRecord));
            setShowReplaceUpload(false);
            setUploadSuccessMsg('Ficha assinada verificada e salva com sucesso! Sua solicitação aguarda a aprovação final da Diretoria.');
        } catch (err: any) {
            console.error(err);
            setUploadError(err.message || 'Erro ao processar a ficha assinada. Tente novamente.');
        } finally {
            setUploadStatusMsg(null);
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const clean = dateStr.split('T')[0];
        const parts = clean.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const getFullAffiliationName = (type: string) => {
        if (type === 'Ambos') return 'Associação dos Auditores de Controle Externo do TCE-PE e Sindicato dos Auditores do TCE-PE';
        if (type === 'Associação') return 'Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco';
        return 'Sindicato dos Auditores do Tribunal de Contas do Estado de Pernambuco';
    };

    const getDocumentDate = (created_at: string) => {
        const date = new Date(created_at);
        return {
            day: date.getDate(),
            month: date.toLocaleString('pt-BR', { month: 'long' }),
            year: date.getFullYear()
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-red-100">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Acesso Indisponível</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/associe-se" className="inline-block bg-primary-900 text-white font-bold py-2.5 px-6 rounded-lg">
                        Voltar para Filiação
                    </Link>
                </div>
            </div>
        );
    }

    // TELA DE BLOQUEIO POR CREDENCIAIS (sem sessão Admin e sem CPF + Matrícula validados)
    if (!data) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 mb-4">
                            <Lock size={28} />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                            Acesso Protegido à Ficha
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                            Para proteger seus dados pessoais e impedir envios indevidos, confirme seu <strong>CPF</strong> e sua <strong>Matrícula TCE-PE</strong> para acessar esta ficha.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyCredentials} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                CPF do Associado
                            </label>
                            <input
                                type="text"
                                value={gateCpf}
                                onChange={(e) => setGateCpf(e.target.value)}
                                placeholder="000.000.000-00"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Matrícula TCE-PE
                            </label>
                            <input
                                type="text"
                                value={gateMatricula}
                                onChange={(e) => setGateMatricula(e.target.value)}
                                placeholder="Ex: 1234"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                        </div>

                        {gateError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{gateError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={gateLoading}
                            className="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                        >
                            {gateLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            Validar Credenciais e Acessar Ficha
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <Link to="/associe-se" className="text-gray-500 hover:text-primary-700 font-medium">
                            &larr; Voltar para Filiação
                        </Link>
                        <Link to="/area-do-filiado" className="text-primary-700 hover:underline font-bold">
                            Sou Administrador — Fazer Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const docDate = getDocumentDate(data.created_at);
    const hasSignedPdf = Boolean(data.signed_pdf_url && data.signature_metadata?.verified);
    const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    const canUploadOrReplace = isAdmin || (!hasSignedPdf && (!data.status || data.status === 'Pendente'));

    return (
        <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-4 flex flex-col items-center print:p-0 print:bg-white print:min-h-0">

            {/* Barra Superior de Navegação (Oculta na impressão) */}
            <div className="no-print print:hidden w-full max-w-4xl flex flex-wrap justify-between items-center gap-3 mb-5 bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-gray-100">
                <button
                    type="button"
                    onClick={handleExitSession}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-700 font-semibold text-xs sm:text-sm"
                >
                    {isAdmin ? <ArrowLeft size={17} /> : <LogOut size={16} />}
                    {isAdmin ? 'Voltar ao Painel Admin' : 'Encerrar Sessão da Ficha'}
                </button>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-900 transition-all shadow-sm"
                    >
                        <Printer size={16} /> Imprimir na Tela
                    </button>
                </div>
            </div>

            {/* PAINEL INTERATIVO 100% ONLINE (CELULAR E DESKTOP - Oculto na impressão) */}
            <div className="no-print print:hidden w-full max-w-4xl mb-6 space-y-4">
                {data.status === 'Aprovado' && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={28} />
                            <div>
                                <h2 className="text-lg font-extrabold text-green-900">Filiação Aprovada pela Diretoria!</h2>
                                <p className="text-sm text-green-800 mt-1">
                                    Seu cadastro já está ativo na base de associados. Agora você já pode criar sua senha no Primeiro Acesso para entrar na Área do Filiado.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/primeiro-acesso"
                            className="w-full md:w-auto text-center bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-3 rounded-xl text-sm shadow transition-colors shrink-0"
                        >
                            Fazer Primeiro Acesso &rarr;
                        </Link>
                    </div>
                )}

                {hasSignedPdf && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700 shrink-0">
                                    <ShieldCheck size={26} />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                                        Ficha Assinada com Gov.br Recebida e Validada!
                                    </h2>
                                    <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                                        <strong>Titular confirmado:</strong> {data.signature_metadata?.signerName}{' '}
                                        {data.signature_metadata?.signerCpfMasked ? `(${data.signature_metadata.signerCpfMasked})` : ''}
                                        <br />
                                        <strong>Emissor:</strong> {data.signature_metadata?.issuer}
                                        {data.signature_metadata?.signedAt ? ` • Assinado em ${data.signature_metadata.signedAt}` : ''}
                                    </p>
                                    {data.status !== 'Aprovado' && (
                                        <p className="text-xs text-emerald-700 mt-2 font-medium">
                                            Documento protegido contra alterações. Aguardando validação e aprovação final da Diretoria.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openOrDownloadPdfUrl(data.signed_pdf_url!, data.signed_pdf_name || buildFichaFileName(data.full_name))}
                                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-colors"
                                >
                                    <FileCheck2 size={16} /> Ver PDF Assinado
                                </button>
                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setShowReplaceUpload((prev) => !prev)}
                                        className="flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-semibold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors"
                                    >
                                        <RefreshCw size={14} /> {showReplaceUpload ? 'Cancelar' : 'Substituir PDF (Admin)'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {((!hasSignedPdf && data.status === 'Pendente') || (isAdmin && showReplaceUpload) || (!hasSignedPdf && !data.status)) && (
                    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 sm:p-6">
                        <div className="mb-5">
                            <span className="inline-block bg-primary-50 text-primary-700 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                                Conclusão 100% Online • Celular ou Computador
                            </span>
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                                Finalize sua Filiação com Assinatura Digital Gov.br
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                Siga os 3 passos abaixo para baixar seu formulário, assinar no Gov.br e enviar aqui mesmo pelo site:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* PASSO 1: BAIXAR PDF */}
                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-primary-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                                        <h3 className="font-bold text-slate-900 text-sm">Baixar Ficha em PDF</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Gera o arquivo PDF oficial da sua ficha cadastral pronto para assinar no celular ou PC.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadPdf}
                                        disabled={pdfLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-primary-900 hover:bg-primary-800 text-white font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-60"
                                    >
                                        {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        Baixar PDF Agora
                                    </button>
                                    {canShare && (
                                        <button
                                            type="button"
                                            onClick={handleSharePdf}
                                            disabled={shareLoading}
                                            className="w-full flex items-center justify-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                                        >
                                            {shareLoading ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                                            Enviar para Arquivos / Celular
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* PASSO 2: ASSINAR NO GOV.BR */}
                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">2</span>
                                        <h3 className="font-bold text-slate-900 text-sm">Assinar pelo Gov.br</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Acesse o Assinador Gov.br (ou o app Gov.br no celular em <em>&ldquo;Assinar documentos&rdquo;</em>), assine o PDF baixado no Passo 1 e salve a versão assinada.
                                    </p>
                                </div>
                                <a
                                    href="https://assinador.iti.br"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm shadow-sm transition-colors"
                                >
                                    Abrir Assinador Gov.br <ExternalLink size={15} />
                                </a>
                            </div>

                            {/* PASSO 3: ANEXAR PDF ASSINADO */}
                            <div className="border-2 border-dashed border-secondary-400 rounded-xl p-4 bg-amber-50/40 flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 rounded-full bg-secondary-500 text-primary-900 text-xs font-bold flex items-center justify-center">3</span>
                                        <h3 className="font-bold text-slate-900 text-sm">Anexar Ficha Assinada</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        O portal confere automaticamente a assinatura digital Gov.br e o seu nome/CPF antes de gravar no sistema.
                                    </p>
                                </div>
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={handleSignedFileSelected}
                                        disabled={!canUploadOrReplace || uploading}
                                        className="hidden"
                                        id="govbr-signed-pdf-input"
                                    />
                                    <label
                                        htmlFor="govbr-signed-pdf-input"
                                        className={`w-full flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm shadow-sm transition-colors cursor-pointer ${(!canUploadOrReplace || uploading) ? 'opacity-60 pointer-events-none' : ''}`}
                                    >
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={17} />}
                                        {uploading ? 'Validando Assinatura...' : 'Anexar PDF Assinado'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {uploadStatusMsg && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-800 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin shrink-0" />
                                <span>{uploadStatusMsg}</span>
                            </div>
                        )}

                        {uploadError && (
                            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Assinatura não aceita</p>
                                    <p className="mt-0.5">{uploadError}</p>
                                </div>
                            </div>
                        )}

                        {uploadSuccessMsg && (
                            <div className="mt-4 p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs sm:text-sm text-green-800 flex items-start gap-2.5">
                                <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                                <span>{uploadSuccessMsg}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PRINTABLE FORM */}
            <div className="bg-white p-5 sm:p-10 text-black font-serif max-w-4xl w-full shadow-2xl border-2 border-slate-200 printable-form">
                <div className="text-center mb-5 border-b-2 border-black pb-3">
                    <img
                        src="/logo-declaracao.png"
                        alt="Associação dos Auditores de Controle Externo do TCE-PE"
                        className="h-16 sm:h-20 w-auto mx-auto object-contain mb-2"
                    />
                    <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider">Formulário de Admissão</h1>
                </div>

                <div className="space-y-3.5">
                    <div className="bg-slate-100 p-2 font-bold uppercase text-xs sm:text-sm border-y border-black">1. Dados Pessoais</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-10 gap-y-2 text-xs sm:text-sm leading-relaxed">
                        <div className="sm:col-span-2 print:col-span-2"><span className="font-bold">Nome Completo:</span> {data.full_name}</div>
                        <div><span className="font-bold">CPF:</span> {data.cpf}</div>
                        <div><span className="font-bold">RG:</span> {data.rg}</div>
                        <div><span className="font-bold">Data de Nascimento:</span> {formatDate(data.birth_date)}</div>
                        <div><span className="font-bold">Naturalidade:</span> {data.birthplace}</div>
                        <div className="sm:col-span-2 print:col-span-2"><span className="font-bold">Endereço Residencial:</span> {data.address}</div>
                    </div>

                    <div className="bg-slate-100 p-2 font-bold uppercase text-xs sm:text-sm border-y border-black">2. Dados Funcionais e Contato</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-10 gap-y-2 text-xs sm:text-sm leading-relaxed">
                        <div><span className="font-bold">Matrícula TCE-PE:</span> {data.matricula}</div>
                        <div><span className="font-bold">Cargo Atual:</span> {data.role}</div>
                        <div className="break-all"><span className="font-bold">E-mail Institucional:</span> {data.email_institutional}</div>
                        <div className="break-all"><span className="font-bold">E-mail Particular:</span> {data.email_personal || 'N/A'}</div>
                        <div><span className="font-bold">Telefone Fixo:</span> {data.phone_fixed || 'N/A'}</div>
                        <div><span className="font-bold">Celular / WhatsApp:</span> {data.phone_mobile}</div>
                        <div className="sm:col-span-2 print:col-span-2"><span className="font-bold">Situação Funcional:</span> {data.is_retired ? 'Aposentado' : 'Auditores na Ativa'}</div>
                    </div>

                    <div className="bg-slate-100 p-2 font-bold uppercase text-xs sm:text-sm border-y border-black">3. Filiação Solicitada</div>
                    <div className="text-xs sm:text-sm italic px-2">
                        <span className="font-bold">Entidade(s) para Adesão:</span> {getFullAffiliationName(data.affiliation_type)}
                    </div>

                    <div className="mt-5 p-4 border border-black text-xs leading-6">
                        <p className="mb-3">
                            Solicito a minha inclusão conforme selecionado acima e <span className="font-bold underline">autorizo o débito da contribuição mensal</span> em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. Declaro estar ciente e de acordo com as regras estatutárias das entidades representativas, as quais tive prévio conhecimento.
                        </p>
                        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-end print:items-end gap-6 mt-10 px-2 sm:px-4">
                            <div>
                                <p className="text-xs sm:text-sm font-medium">Recife - PE, {docDate.day} de {docDate.month} de {docDate.year}</p>
                            </div>
                            <div className="text-center w-full sm:w-72 print:w-72">
                                {data.signature_metadata?.verified && (
                                    <p className="text-[9px] font-sans font-bold text-emerald-800 uppercase mb-1.5 tracking-tight">
                                        Assinado digitalmente via {data.signature_metadata.issuer}
                                    </p>
                                )}
                                <div className="border-t border-black pt-2">
                                    <p className="text-xs sm:text-sm font-bold uppercase">Assinatura do Associado</p>
                                    <p className="text-[11px] text-gray-500 mt-1">{data.full_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-[10px] text-gray-500 text-center border-t border-slate-200 pt-2.5 break-all">
                        Este documento é uma representação digital da proposta enviada em {new Date(data.created_at).toLocaleString('pt-BR')} via Site Auditores TCE-PE.<br/>
                        ID de Autenticidade: {id}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    header, nav, footer, .no-print { display: none !important; }
                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    .min-h-screen {
                        min-height: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .printable-form {
                        box-shadow: none !important;
                        border: 2px solid black !important;
                        margin: 0 !important;
                        padding: 1.25rem 1.5rem !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
};

export default MembershipFichaView;
