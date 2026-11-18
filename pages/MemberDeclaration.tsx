import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { ArrowLeft, Printer, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import useInactivityTimer from '../hooks/useInactivityTimer';
import {
    DeclarationEntityType,
    DeclarationPurpose,
    DeclarationRecord,
    ENTITY_CONFIG,
    INSTITUTION_INFO,
    buildValidationUrl,
    issueDeclaration,
} from '../services/declarationService';

interface MemberProfile {
    full_name: string;
    matricula: string;
    email?: string;
    status: string;
    is_associado?: boolean | null;
    is_filiado?: boolean | null;
}

const MemberDeclaration: React.FC = () => {
    const navigate = useNavigate();
    useInactivityTimer(240);

    const [loading, setLoading] = useState(true);
    const [issuing, setIssuing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [member, setMember] = useState<MemberProfile | null>(null);
    const [entityType, setEntityType] = useState<DeclarationEntityType>('associacao');
    const [purpose, setPurpose] = useState<DeclarationPurpose>('fisco_saude');
    const [customRecipient, setCustomRecipient] = useState('');
    const [debouncedRecipient, setDebouncedRecipient] = useState('');
    const [declaration, setDeclaration] = useState<DeclarationRecord | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [logoFallback, setLogoFallback] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedRecipient(customRecipient);
        }, 450);
        return () => clearTimeout(timer);
    }, [customRecipient]);

    useEffect(() => {
        const loadMember = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/area-do-filiado');
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                await supabase.auth.signOut();
                navigate('/area-do-filiado', {
                    state: { error: 'Sessão expirada ou inválida. Faça login novamente.' },
                });
                return;
            }

            const cleanSessionEmail = (user.email || '').trim();
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('full_name, matricula, email, status, is_associado, is_filiado')
                .or(
                    `email.ilike.${cleanSessionEmail},email_institutional.ilike.${cleanSessionEmail},email_personal.ilike.${cleanSessionEmail}`
                )
                .maybeSingle();

            if (memberError) {
                setError(`Erro ao consultar cadastro: ${memberError.message}`);
                setLoading(false);
                return;
            }

            if (!memberData) {
                await supabase.auth.signOut();
                navigate('/area-do-filiado', { state: { error: 'Cadastro de associado não encontrado.' } });
                return;
            }

            if (memberData.status !== 'active') {
                await supabase.auth.signOut();
                navigate('/area-do-filiado', { state: { error: 'Conta não ativa.' } });
                return;
            }

            const hasAssoc = Boolean(memberData.is_associado);
            const hasSind = Boolean(memberData.is_filiado);

            if (!hasAssoc && !hasSind) {
                setError(
                    'A emissão da Declaração está disponível apenas para associados da AUDITORES-TCE/PE ou filiados do Sindicato (AUDITORES SINDICAL) com vínculo ativo.'
                );
                setLoading(false);
                return;
            }

            setEntityType(hasAssoc ? 'associacao' : 'sindicato');
            setMember(memberData as MemberProfile);
            setLoading(false);
        };

        loadMember();
    }, [navigate]);

    const generateDocument = useCallback(async () => {
        if (!member) return;
        setIssuing(true);
        setError(null);
        setLogoFallback(false);
        try {
            const rec = await issueDeclaration(
                purpose,
                purpose === 'custom' ? debouncedRecipient : undefined,
                entityType
            );
            setDeclaration(rec);

            const validationUrl = buildValidationUrl(rec);
            const dataUrl = await QRCode.toDataURL(validationUrl, {
                width: 240,
                margin: 1,
                errorCorrectionLevel: 'M',
                color: {
                    dark: '#0f172a',
                    light: '#ffffff',
                },
            });
            setQrDataUrl(dataUrl);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Não foi possível gerar a declaração.';
            setDeclaration(null);
            setQrDataUrl('');
            setError(msg);
        } finally {
            setIssuing(false);
        }
    }, [member, entityType, purpose, debouncedRecipient]);

    useEffect(() => {
        if (member) {
            generateDocument();
        }
    }, [member, generateDocument]);

    const handlePrint = () => {
        window.print();
    };

    const formatFullDatePt = (isoStr: string) => {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return '';
        const day = d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife', day: 'numeric' });
        const month = d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife', month: 'long' });
        const year = d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife', year: 'numeric' });
        return `${day} de ${month} de ${year}`;
    };

    const formatDateTimePt = (isoStr: string) => {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return '';
        const date = d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' });
        const time = d.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Recife',
            hour: '2-digit',
            minute: '2-digit',
        });
        return `${date} às ${time}`;
    };

    const formatShortDatePt = (isoStr: string) => {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Loader2 className="animate-spin text-primary-700" size={32} />
            </div>
        );
    }

    if (error && !member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
                <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={40} />
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Emissão Indisponível</h2>
                    <p className="text-sm text-slate-600 mb-6">{error}</p>
                    <Link
                        to="/area-do-filiado/dashboard"
                        className="inline-flex items-center gap-2 bg-primary-900 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary-800 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> Voltar ao Painel
                    </Link>
                </div>
            </div>
        );
    }

    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const validationUrl = declaration ? buildValidationUrl(declaration) : `${originUrl}/#/validar-declaracao`;
    const activeRecipient =
        purpose === 'custom'
            ? (declaration?.custom_recipient || customRecipient).trim()
            : '';

    const canIssueAssoc = Boolean(member?.is_associado);
    const canIssueSind = Boolean(member?.is_filiado);
    const activeEntityMeta = ENTITY_CONFIG[declaration?.entity_type || entityType];

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center">
            {/* Barra Horizontal Enxuta (Oculta na impressão) */}
            <div className="no-print w-full max-w-[21cm] mb-5 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link
                    to="/area-do-filiado/dashboard"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-800 font-medium text-sm shrink-0"
                >
                    <ArrowLeft size={17} /> Voltar ao Painel
                </Link>

                <div className="flex flex-wrap items-center gap-2.5 justify-end">
                    <select
                        aria-label="Entidade Emissora"
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value as DeclarationEntityType)}
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-primary-600 font-medium"
                    >
                        <option value="associacao" disabled={!canIssueAssoc}>
                            Associação (AUDITORES-TCE/PE){!canIssueAssoc ? ' — Não vinculado' : ''}
                        </option>
                        <option value="sindicato" disabled={!canIssueSind}>
                            Sindicato (AUDITORES SINDICAL){!canIssueSind ? ' — Não vinculado' : ''}
                        </option>
                    </select>

                    <select
                        aria-label="Finalidade da Declaração"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value as DeclarationPurpose)}
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-primary-600"
                    >
                        <option value="fisco_saude">Convênio Fisco Saúde (Padrão)</option>
                        <option value="geral">Fins Gerais</option>
                        <option value="custom">Outra Entidade...</option>
                    </select>

                    {purpose === 'custom' && (
                        <input
                            type="text"
                            value={customRecipient}
                            onChange={(e) => setCustomRecipient(e.target.value)}
                            placeholder="Nome / CNPJ da entidade"
                            maxLength={140}
                            className="text-sm border border-slate-300 rounded-lg px-3 py-2 w-48 sm:w-56 text-slate-800 focus:outline-none focus:border-primary-600"
                        />
                    )}

                    <button
                        onClick={handlePrint}
                        disabled={issuing || !declaration}
                        className="inline-flex items-center gap-2 bg-primary-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-primary-800 transition-colors disabled:opacity-50 shrink-0"
                    >
                        {issuing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        Imprimir / Salvar PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="no-print w-full max-w-[21cm] mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* FOLHA A4 OFICIAL DA DECLARAÇÃO (Renderizada somente após emissão autenticada no servidor) */}
            {issuing && !error && (
                <div className="no-print w-full max-w-[21cm] bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-slate-600">
                    <Loader2 className="animate-spin text-primary-700" size={28} />
                    <span className="text-sm font-medium">Autenticando e emitindo declaração oficial...</span>
                </div>
            )}

            {declaration && !error && !issuing && (
            <div className="bg-white text-black w-full max-w-[21cm] min-h-[26cm] shadow-lg border border-slate-300 px-10 py-12 sm:px-14 sm:py-14 printable-declaration flex flex-col justify-between">
                <div>
                    {/* Cabeçalho Institucional conforme entidade emissora */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        {!logoFallback ? (
                            <img
                                src={activeEntityMeta.logoUrl}
                                alt={activeEntityMeta.fullName}
                                onError={() => setLogoFallback(true)}
                                className="h-24 sm:h-28 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt={activeEntityMeta.shortName} className="h-20 w-20 object-contain" />
                                <div className="text-left">
                                    <div className="text-2xl font-extrabold tracking-tight text-[#0070c0]">AUDITORES</div>
                                    <div className="text-base font-bold text-[#1e3a8a]">{activeEntityMeta.shortName}</div>
                                    <div className="text-xs text-slate-600">{activeEntityMeta.fullName}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Título */}
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-2xl font-normal tracking-[0.28em] text-black underline underline-offset-4 decoration-1">
                            DECLARAÇÃO
                        </h1>
                    </div>

                    {/* Corpo Jurídico Direto e Fundamentado */}
                    <div className="font-serif text-[15px] sm:text-[15.5px] leading-[1.85] text-justify text-black space-y-5">
                        <p className="indent-10">
                            {activeEntityMeta.article}{' '}
                            <strong>
                                {activeEntityMeta.fullName} – {activeEntityMeta.shortName}
                            </strong>{' '}
                            (CNPJ: <strong>{activeEntityMeta.cnpj}</strong>) vem declarar,{' '}
                            {purpose === 'fisco_saude' && (
                                <>
                                    para os devidos fins de direito, inclusive para adesão ao{' '}
                                    <strong>Fisco Saúde</strong> (CNPJ:{' '}
                                    <strong>{INSTITUTION_INFO.fiscoSaudeCnpj}</strong>), nos termos do convênio firmado
                                    entre estas entidades,{' '}
                                </>
                            )}
                            {purpose === 'geral' && (
                                <>
                                    para os devidos fins de direito e comprovação perante órgãos públicos ou
                                    instituições privadas,{' '}
                                </>
                            )}
                            {purpose === 'custom' && (
                                <>
                                    para os devidos fins de direito,{' '}
                                    {activeRecipient ? (
                                        <>
                                            inclusive para fins de comprovação e adesão junto a{' '}
                                            <strong>{activeRecipient}</strong>,{' '}
                                        </>
                                    ) : (
                                        <>
                                            e comprovação perante entidades conveniadas e órgãos interessados,{' '}
                                        </>
                                    )}
                                </>
                            )}
                            que <strong>{declaration.member_name}</strong>, Matrícula TCE-PE nº{' '}
                            <strong>{declaration.member_matricula}</strong>, é integrante do{' '}
                            {activeEntityMeta.groupLabel} na condição de{' '}
                            <strong>{activeEntityMeta.memberLabel}</strong>, estando em pleno gozo de seus direitos e
                            em dia com suas obrigações estatutárias e financeiras.
                        </p>

                        <p className="indent-10">
                            Por ser expressão da verdade, firma-se a presente declaração eletrônica, com validade de{' '}
                            <strong>60 (sessenta) dias</strong> a contar de sua emissão, cuja autenticidade pode ser
                            verificada a qualquer tempo pelo QR Code ou pelo Código de Autenticidade abaixo, gozando
                            de plena validade jurídica nos termos do art. 10, § 2º, da Medida Provisória nº
                            2.200-2/2001, do art. 219 do Código Civil (Lei nº 10.406/2002) e do art. 411, inciso II, do
                            Código de Processo Civil (Lei nº 13.105/2015).
                        </p>
                    </div>

                    {/* Local, Data e Assinatura Eletrônica */}
                    <div className="mt-8 font-serif text-[15px] sm:text-[15.5px] text-black">
                        <p className="mb-8">
                            Recife,{' '}
                            {declaration
                                ? formatFullDatePt(declaration.issued_at)
                                : formatFullDatePt(new Date().toISOString())}
                            .
                        </p>

                        <div className="border-t border-b border-slate-300 py-2.5 px-6 text-center max-w-md mx-auto">
                            <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                                {declaration.signer_name || activeEntityMeta.signerName}
                            </p>
                            <p className="font-sans text-[11px] text-slate-600 mt-0.5">
                                {declaration.signer_role || INSTITUTION_INFO.defaultSignerRole}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quadro de Autenticidade (QR Code) e Rodapé Institucional */}
                <div className="mt-8">
                    <div className="flex items-center gap-4 border border-slate-400 bg-white p-3">
                        <div className="shrink-0 bg-white">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code de Autenticidade da Declaração"
                                    className="w-20 h-20 object-contain"
                                />
                            ) : (
                                <div className="w-20 h-20 flex items-center justify-center text-slate-400">
                                    <Loader2 size={18} className="animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-[11px] leading-relaxed text-slate-800">
                            <p>
                                <strong>Código de Autenticidade:</strong>{' '}
                                <span className="font-mono font-bold text-black">
                                    {declaration.verification_code}
                                </span>
                            </p>
                            <p className="mt-0.5">
                                <strong>Emissão:</strong> {formatDateTimePt(declaration.issued_at)} &nbsp;|&nbsp;{' '}
                                <strong>Válida até:</strong> {formatShortDatePt(declaration.valid_until)} (60 dias)
                            </p>
                            <p className="mt-0.5 text-[10.5px] text-slate-700">
                                <strong>Validação Pública:</strong> aponte a câmera para o QR Code ou acesse{' '}
                                <a
                                    href={validationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-primary-900 break-all"
                                >
                                    {originUrl}/#/validar-declaracao
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-300 text-center text-[10px] text-slate-600 leading-snug">
                        <p className="font-semibold text-slate-800">
                            {activeEntityMeta.footerTitle}
                        </p>
                        <p>
                            CNPJ: {activeEntityMeta.cnpj} • {INSTITUTION_INFO.address} • Telefone:{' '}
                            {INSTITUTION_INFO.phone}
                        </p>
                    </div>
                </div>
            </div>
            )}

            <style>{`
                @media print {
                    header,
                    footer,
                    .no-print {
                        display: none !important;
                    }
                    html,
                    body,
                    #root,
                    .min-h-screen {
                        min-height: 0 !important;
                        height: auto !important;
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .printable-declaration {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0.4cm 0.5cm !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        min-height: 24.2cm !important;
                        max-height: 25.5cm !important;
                        page-break-inside: avoid;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 1.4cm;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberDeclaration;
