import React, { useState } from 'react';
import {
    ArrowRight,
    User,
    Briefcase,
    FileText,
    Send,
    Loader2,
    Check,
    ArrowLeft,
    Search,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const JoinUs: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Consulta / Retomada de ficha existente mediante credenciais (CPF + Matrícula)
    const [showLookup, setShowLookup] = useState(false);
    const [lookupCpf, setLookupCpf] = useState('');
    const [lookupMatricula, setLookupMatricula] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        // Passo 1: Dados Pessoais
        fullName: '',
        cpf: '',
        rg: '',
        birthDate: '',
        birthplace: '',
        address: '',

        // Passo 2: Dados Funcionais
        matricula: '',
        role: 'Auditor de CE - Contas',
        isRetired: false,
        emailInstitutional: '',
        emailPersonal: '',
        phoneFixed: '',
        phoneMobile: '',

        // Passo 3: Filiação
        affiliationType: 'Ambos', // 'Associação', 'Sindicato', 'Ambos'
        termsAccepted: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let val: any = value;
        if (type === 'checkbox') val = (e.target as HTMLInputElement).checked;
        if (name === 'isRetired') val = value === 'true';

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        const cpfDigits = lookupCpf.replace(/\D/g, '');
        const cleanMatricula = lookupMatricula.trim();

        if (cpfDigits.length !== 11 || !cleanMatricula) {
            setLookupError('Informe o CPF completo (11 dígitos) e a matrícula TCE-PE.');
            return;
        }

        setLookupLoading(true);
        setLookupError(null);

        try {
            // 1. Consulta segura via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('lookup_membership_application', {
                p_cpf: cpfDigits,
                p_matricula: cleanMatricula
            });

            if (!rpcError) {
                if (rpcData && (rpcData as any).id) {
                    navigate(`/filiados/ficha/${(rpcData as any).id}`, {
                        state: {
                            verifiedCpf: cpfDigits,
                            verifiedMatricula: cleanMatricula
                        }
                    });
                    return;
                }
                setLookupError('Nenhuma solicitação encontrada para este CPF e matrícula. Verifique os dados ou preencha o cadastro abaixo.');
                return;
            }

            // 2. Fallback caso o script SQL ainda não tenha sido aplicado no banco
            const { data: rows } = await supabase
                .from('membership_applications')
                .select('id, cpf, matricula')
                .eq('matricula', cleanMatricula);

            const match = (rows || []).find(
                (r: any) => String(r.cpf || '').replace(/\D/g, '') === cpfDigits
            );

            if (match?.id) {
                navigate(`/filiados/ficha/${match.id}`, {
                    state: {
                        verifiedCpf: cpfDigits,
                        verifiedMatricula: cleanMatricula
                    }
                });
                return;
            }

            setLookupError('Nenhuma solicitação encontrada para este CPF e matrícula.');
        } catch (err) {
            console.error(err);
            setLookupError('Erro ao buscar solicitação. Tente novamente.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cpfDigits = formData.cpf.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
            setError('Informe um CPF válido com 11 dígitos antes de prosseguir.');
            setLoading(false);
            return;
        }

        try {
            // 1. Gerar ID seguro no cliente e salvar no Supabase (sem exigir SELECT anônimo pós-INSERT)
            const appId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });

            const payload = {
                id: appId,
                full_name: formData.fullName.trim(),
                cpf: formData.cpf.trim(),
                rg: formData.rg.trim(),
                birth_date: formData.birthDate,
                birthplace: formData.birthplace.trim(),
                address: formData.address.trim(),
                matricula: formData.matricula.trim(),
                role: formData.role,
                is_retired: formData.isRetired,
                email_institutional: formData.emailInstitutional.trim(),
                email_personal: formData.emailPersonal.trim(),
                phone_fixed: formData.phoneFixed.trim(),
                phone_mobile: formData.phoneMobile.trim(),
                affiliation_type: formData.affiliationType,
                terms_accepted: formData.termsAccepted
            };

            const { error: supabaseError } = await supabase
                .from('membership_applications')
                .insert([payload]);

            if (supabaseError) throw supabaseError;

            // 2. Notificar a Associação em segundo plano com minimização de dados (LGPD)
            const adminUrl = `${window.location.origin}${window.location.pathname}#/admin`;
            const emailBody = {
                _subject: `Nova Solicitação de Filiação: ${payload.full_name} (Mat. ${payload.matricula})`,
                _template: 'table',
                _captcha: 'false',
                _language: 'pt',
                'Associado': payload.full_name,
                'Matrícula TCE-PE': payload.matricula,
                'Cargo': payload.role,
                'Situação Funcional': payload.is_retired ? 'Aposentado' : 'Auditores na Ativa',
                'Tipo de Adesão': payload.affiliation_type,
                'Painel_Administrativo': adminUrl,
                'Proteção_LGPD': 'Dados pessoais sensíveis (CPF, RG, endereço e ficha assinada Gov.br) protegidos e acessíveis exclusivamente via login administrativo no portal.'
            };

            fetch('https://formsubmit.co/ajax/13ae6adc7181116bc0173267ef273d47', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailBody)
            }).catch((emailErr) => {
                console.warn('Aviso: falha ao notificar a associação por e-mail, mas dados salvos no Supabase.', emailErr);
            });

            // 3. Direcionar para a Ficha Online carregando as credenciais apenas em memória
            navigate(`/filiados/ficha/${appId}`, {
                state: {
                    verifiedCpf: cpfDigits,
                    verifiedMatricula: payload.matricula
                }
            });
        } catch (err: any) {
            console.error(err);
            setError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato com a secretaria.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Como no RG" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF <span className="text-red-500">*</span></label>
                                <input name="cpf" value={formData.cpf} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="000.000.000-00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RG <span className="text-red-500">*</span></label>
                                <input name="rg" value={formData.rg} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Número e Órgão Emissor" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento <span className="text-red-500">*</span></label>
                                <input name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade <span className="text-red-500">*</span></label>
                                <input name="birthplace" value={formData.birthplace} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Cidade - UF" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo <span className="text-red-500">*</span></label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-20" placeholder="Rua, número, complemento, bairro, cidade e CEP" />
                            </div>
                        </div>
                        {error && step === 1 && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (!formData.fullName || !formData.cpf || !formData.rg || !formData.birthDate || !formData.birthplace || !formData.address) {
                                    setError('Por favor, preencha todos os campos obrigatórios marcados com *.');
                                    return;
                                }
                                if (formData.cpf.replace(/\D/g, '').length !== 11) {
                                    setError('Informe um CPF válido com 11 dígitos.');
                                    return;
                                }
                                setError(null);
                                nextStep();
                            }}
                            className="w-full bg-primary-900 text-white font-bold py-3 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Avançar <ArrowRight size={18} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula TCE-PE <span className="text-red-500">*</span></label>
                                <input name="matricula" value={formData.matricula} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: 1234" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-red-500">*</span></label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                                    <option>Auditor de CE - Contas</option>
                                    <option>Auditor de CE - Obras</option>
                                    <option>Auditor de CE - TI</option>
                                    <option>Auditor de CE - Saúde</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Situação Funcional <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-sm ${!formData.isRetired ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500 font-semibold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <input type="radio" name="isRetired" value="false" checked={!formData.isRetired} onChange={handleInputChange} className="hidden" />
                                        <span>Auditor na Ativa</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-sm ${formData.isRetired ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500 font-semibold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                        <input type="radio" name="isRetired" value="true" checked={formData.isRetired} onChange={handleInputChange} className="hidden" />
                                        <span>Auditor Aposentado</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional <span className="text-xs text-gray-400 font-normal ml-1">(Obrigatório ao menos 1)</span></label>
                                <input name="emailInstitutional" type="email" value={formData.emailInstitutional} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="seuemail@tcepe.tc.br" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Particular</label>
                                <input name="emailPersonal" type="email" value={formData.emailPersonal} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="seuemail@pessoal.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Fixo (Opcional)</label>
                                <input name="phoneFixed" value={formData.phoneFixed} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="(81) 0000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Celular / WhatsApp <span className="text-red-500">*</span></label>
                                <input name="phoneMobile" value={formData.phoneMobile} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="(81) 90000-0000" />
                            </div>
                        </div>
                        {error && step === 2 && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button type="button" onClick={() => { setError(null); prevStep(); }} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft size={18} /> Voltar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!formData.matricula || !formData.phoneMobile) {
                                        setError('Por favor, preencha os campos obrigatórios marcados com *.');
                                        return;
                                    }
                                    if (!formData.emailInstitutional && !formData.emailPersonal) {
                                        setError('Por favor, preencha pelo menos um e-mail (Institucional ou Particular).');
                                        return;
                                    }
                                    setError(null);
                                    nextStep();
                                }}
                                className="flex-1 bg-primary-900 text-white font-bold py-3 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                            >
                                Avançar <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-sm text-blue-900">
                            Ao se filiar, você fortalece as prerrogativas da carreira de Auditor de Controle Externo e garante acesso à assessoria jurídica e convênios exclusivos.
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Desejo me filiar ao(à):</label>
                            <div className="grid grid-cols-1 gap-3">
                                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.affiliationType === 'Associação' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="affiliationType" value="Associação" checked={formData.affiliationType === 'Associação'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                                        <div>
                                            <p className="font-bold text-slate-800">Associação (Auditores-TCE/PE)</p>
                                            <p className="text-xs text-gray-500">Contribuição mensal de R$ 130,00</p>
                                        </div>
                                    </div>
                                    <Check size={20} className={formData.affiliationType === 'Associação' ? 'text-primary-500' : 'text-transparent'} />
                                </label>
                                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.affiliationType === 'Sindicato' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="affiliationType" value="Sindicato" checked={formData.affiliationType === 'Sindicato'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                                        <div>
                                            <p className="font-bold text-slate-800">Sindicato (Auditores SINDICAL)</p>
                                            <p className="text-xs text-gray-500">R$ 130,00 (R$ 35,00 se já for associado)</p>
                                        </div>
                                    </div>
                                    <Check size={20} className={formData.affiliationType === 'Sindicato' ? 'text-primary-500' : 'text-transparent'} />
                                </label>
                                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${formData.affiliationType === 'Ambos' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="affiliationType" value="Ambos" checked={formData.affiliationType === 'Ambos'} onChange={handleInputChange} className="w-4 h-4 text-primary-600" />
                                        <div>
                                            <p className="font-bold text-slate-800">Ambos (Associação + Sindicato)</p>
                                            <p className="text-xs text-gray-500">Valor total de R$ 165,00</p>
                                        </div>
                                    </div>
                                    <Check size={20} className={formData.affiliationType === 'Ambos' ? 'text-primary-500' : 'text-transparent'} />
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500" required />
                                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                    Solicito a minha inclusão conforme selecionado acima e <span className="font-bold">autorizo o débito da contribuição mensal</span> em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. Declaro estar ciente e de acordo com as regras estatutárias das entidades.
                                </label>
                            </div>

                            <div className="flex items-start gap-2.5 pt-3 border-t border-gray-200 text-xs text-slate-700">
                                <ShieldCheck size={16} className="text-primary-700 shrink-0 mt-0.5" />
                                <span>
                                    <strong>Próximo passo 100% online:</strong> ao confirmar, você abrirá sua Ficha de Admissão para baixar o PDF, assinar com o <strong>Gov.br</strong> e anexar o arquivo aqui mesmo no site (sem precisar enviar por e-mail).
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.termsAccepted}
                                className="flex-2 grow bg-secondary-500 text-primary-900 font-bold py-3 px-4 rounded-lg hover:bg-secondary-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Gerar Ficha e Assinar com Gov.br</>}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-14 sm:pt-20 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Intro Section */}
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Filiação Online</h1>
                    <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                        Preencha seus dados, assine a ficha pelo <strong>Gov.br</strong> e envie tudo pelo próprio site, pelo celular ou computador.
                    </p>
                </div>

                {/* Bloco de Retomada / Consulta Protegida por Credenciais (CPF + Matrícula) */}
                <div className="bg-white rounded-2xl shadow-sm border border-primary-100 mb-8 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowLookup(prev => !prev)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-primary-50/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-50 text-primary-700 p-2 rounded-xl shrink-0">
                                <Search size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    Já preencheu o formulário? Acesse sua Ficha ou envie o PDF assinado (Gov.br)
                                </p>
                                <p className="text-xs text-gray-500">
                                    Consulte mediante confirmação do seu CPF e matrícula do TCE-PE
                                </p>
                            </div>
                        </div>
                        <span className="text-primary-700 shrink-0">
                            {showLookup ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                    </button>

                    {showLookup && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60">
                            <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">CPF</label>
                                    <input
                                        type="text"
                                        value={lookupCpf}
                                        onChange={(e) => setLookupCpf(e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Matrícula TCE-PE</label>
                                    <input
                                        type="text"
                                        value={lookupMatricula}
                                        onChange={(e) => setLookupMatricula(e.target.value)}
                                        placeholder="Ex: 1234"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={lookupLoading}
                                    className="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {lookupLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    Acessar Minha Ficha
                                </button>
                            </form>

                            {lookupError && (
                                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{lookupError}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

                    {/* Stepper Sidebar (Horizontal compacto no celular, vertical no desktop) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2 lg:gap-6 bg-white lg:bg-transparent p-3.5 lg:p-0 rounded-xl shadow-sm lg:shadow-none border border-gray-100 lg:border-0">
                            <div className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3 ${step >= 1 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm ${step >= 1 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 1 ? <Check size={18} /> : '1'}
                                </div>
                                <span className="font-bold text-xs lg:text-sm">Pessoal</span>
                            </div>
                            <div className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3 ${step >= 2 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm ${step >= 2 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 2 ? <Check size={18} /> : '2'}
                                </div>
                                <span className="font-bold text-xs lg:text-sm">Profissional</span>
                            </div>
                            <div className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3 ${step >= 3 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold border-2 text-sm ${step >= 3 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 3 ? <Check size={18} /> : '3'}
                                </div>
                                <span className="font-bold text-xs lg:text-sm">Filiação</span>
                            </div>
                        </div>

                        <div className="hidden lg:block bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-800 text-sm mb-3">100% Digital</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                O acesso à ficha e o envio da assinatura Gov.br exigem confirmação de CPF e Matrícula ou login administrativo.
                            </p>
                        </div>
                    </div>

                    {/* Form Component */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-8">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 text-primary-600 mb-2 font-bold uppercase text-xs tracking-widest">
                                {step === 1 && <><User size={16}/> PASSO 1 DE 3: DADOS PESSOAIS</>}
                                {step === 2 && <><Briefcase size={16}/> PASSO 2 DE 3: DADOS FUNCIONAIS</>}
                                {step === 3 && <><FileText size={16}/> PASSO 3 DE 3: FILIAÇÃO E ACEITE</>}
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-600 transition-all duration-500 ease-out"
                                    style={{ width: `${(step / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {renderStep()}
                    </div>

                </div>

                {/* Footer Disclaimer */}
                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>© 2026 Associação e Sindicato dos Auditores de Controle Externo do TCE-PE. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default JoinUs;
