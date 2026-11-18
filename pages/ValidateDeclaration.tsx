import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Printer, Loader2, ArrowLeft } from 'lucide-react';
import {
    ENTITY_CONFIG,
    INSTITUTION_INFO,
    VerificationResult,
    getPurposeLabel,
    verifyDeclaration,
} from '../services/declarationService';

const ValidateDeclaration: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCode = searchParams.get('code') || '';

    const [inputCode, setInputCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const runVerification = useCallback(async (codeToVerify: string) => {
        const clean = codeToVerify.trim().toUpperCase();
        if (!clean) {
            setResult({
                valid: false,
                reason: 'Informe o código de autenticidade impresso no documento (ex.: AUT-2026-XXXXXXXX).',
            });
            setHasChecked(true);
            return;
        }

        setLoading(true);
        try {
            const res = await verifyDeclaration(clean);
            setResult(res);
            setHasChecked(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialCode) {
            setInputCode(initialCode);
            runVerification(initialCode);
        }
    }, [initialCode, runVerification]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clean = inputCode.trim().toUpperCase();
        if (clean) {
            setSearchParams({ code: clean });
        }
        runVerification(clean);
    };

    const formatDateTime = (isoStr: string) => {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return '—';
        return `${d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' })} às ${d.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Recife',
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    };

    const formatDateOnly = (isoStr: string) => {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="no-print mb-5">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-900"
                    >
                        <ArrowLeft size={16} /> Voltar ao Portal
                    </Link>
                </div>

                {/* Consulta Pública */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary-900 mb-1">
                        Validação de Declaração de Filiação
                    </h1>
                    <p className="text-sm text-slate-600 mb-5">
                        {ENTITY_CONFIG.associacao.shortName} (CNPJ: {ENTITY_CONFIG.associacao.cnpj}) e{' '}
                        {ENTITY_CONFIG.sindicato.shortName} (CNPJ: {ENTITY_CONFIG.sindicato.cnpj})
                    </p>

                    <form onSubmit={handleSubmit} className="no-print flex flex-col sm:flex-row gap-2.5">
                        <input
                            id="verification-code"
                            type="text"
                            aria-label="Código de Autenticidade"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="Digite o código (ex.: AUT-2026-XXXXXXXX ou SIN-2026-XXXXXXXX)"
                            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-primary-700"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-900 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-primary-800 transition-colors text-sm disabled:opacity-60 shrink-0"
                        >
                            {loading ? 'Verificando...' : 'Validar'}
                        </button>
                    </form>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                        <Loader2 className="animate-spin text-primary-700 mx-auto mb-2" size={28} />
                        <p className="text-sm text-slate-600">Consultando registro...</p>
                    </div>
                )}

                {!loading && hasChecked && result && (() => {
                    const entityMeta = result.record
                        ? ENTITY_CONFIG[result.record.entity_type]
                        : ENTITY_CONFIG.associacao;
                    const memberRoleLabel =
                        result.record?.entity_type === 'sindicato' ? 'Filiado(a)' : 'Associado(a)';
                    return (
                    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden printable-validation">
                        {result.valid && result.record ? (
                            <>
                                <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                            Conferência de Autenticidade
                                        </p>
                                        <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                                            Documento Autêntico e Dentro do Prazo de Validade
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => window.print()}
                                        className="no-print inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-800 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-slate-50 shrink-0"
                                    >
                                        <Printer size={14} /> Imprimir Comprovante
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-200 text-sm">
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Entidade Emissora</span>
                                        <span className="sm:col-span-2 text-slate-900 font-medium">
                                            {entityMeta.fullName} ({entityMeta.shortName}) — CNPJ: {entityMeta.cnpj}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">{memberRoleLabel}</span>
                                        <span className="sm:col-span-2 text-slate-900 font-bold uppercase">
                                            {result.record.member_name}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Matrícula TCE-PE</span>
                                        <span className="sm:col-span-2 text-slate-900 font-mono font-bold">
                                            {result.record.member_matricula}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Situação Cadastral</span>
                                        <span className="sm:col-span-2 text-emerald-800 font-semibold">
                                            {entityMeta.statusValidText}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Finalidade</span>
                                        <span className="sm:col-span-2 text-slate-800">
                                            {getPurposeLabel(result.record.purpose, result.record.custom_recipient)}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Autenticação</span>
                                        <span className="sm:col-span-2 text-slate-800">
                                            {result.record.signer_name} ({result.record.signer_role})
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Código de Autenticidade</span>
                                        <span className="sm:col-span-2 font-mono font-bold text-slate-900">
                                            {result.record.verification_code}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Emissão</span>
                                        <span className="sm:col-span-2 text-slate-800">
                                            {formatDateTime(result.record.issued_at)}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
                                        <span className="font-semibold text-slate-500">Validade</span>
                                        <span className="sm:col-span-2 text-slate-800">
                                            {formatDateOnly(result.record.valid_until)} (60 dias)
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 text-xs text-slate-600">
                                    Conferência realizada em {formatDateTime(new Date().toISOString())}, nos termos do
                                    art. 10, § 2º, da MP nº 2.200-2/2001 e da Lei nº 14.063/2020.
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                                        Conferência de Autenticidade
                                    </p>
                                    <h2 className="text-base sm:text-lg font-bold text-red-900">
                                        Documento Inválido / Expirado
                                    </h2>
                                </div>

                                <div className="p-6 text-sm space-y-3">
                                    <p className="text-slate-800 font-medium">
                                        {result.reason ||
                                            'Não foi possível confirmar a autenticidade do código informado.'}
                                    </p>

                                    {result.record && (
                                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg text-xs">
                                            <div className="px-4 py-2.5 flex justify-between gap-4">
                                                <span className="text-slate-500 font-semibold">Titular</span>
                                                <span className="text-slate-900 font-bold">
                                                    {result.record.member_name}
                                                </span>
                                            </div>
                                            <div className="px-4 py-2.5 flex justify-between gap-4">
                                                <span className="text-slate-500 font-semibold">Matrícula</span>
                                                <span className="text-slate-900 font-mono font-bold">
                                                    {result.record.member_matricula}
                                                </span>
                                            </div>
                                            <div className="px-4 py-2.5 flex justify-between gap-4">
                                                <span className="text-slate-500 font-semibold">Emissão</span>
                                                <span className="text-slate-900">
                                                    {formatDateOnly(result.record.issued_at)}
                                                </span>
                                            </div>
                                            <div className="px-4 py-2.5 flex justify-between gap-4">
                                                <span className="text-slate-500 font-semibold">Validade</span>
                                                <span className="text-red-700 font-semibold">
                                                    {formatDateOnly(result.record.valid_until)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-500 pt-1">
                                        Em caso de dúvida, contate a secretaria da {INSTITUTION_INFO.shortName} pelo
                                        telefone {INSTITUTION_INFO.phone}.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    );
                })()}
            </div>

            <style>{`
                @media print {
                    header,
                    footer,
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: #ffffff !important;
                    }
                    .printable-validation {
                        box-shadow: none !important;
                        border: 1px solid #94a3b8 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ValidateDeclaration;
