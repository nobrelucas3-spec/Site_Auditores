import React, { useState } from 'react';
import { CheckCircle, ArrowRight, User, Briefcase, FileText, Send, Loader2, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const JoinUs: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        role: 'Auditor de Controle Externo',
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
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Salvar no Supabase
            const { error: supabaseError } = await supabase
                .from('membership_applications')
                .insert([{
                    full_name: formData.fullName,
                    cpf: formData.cpf,
                    rg: formData.rg,
                    birth_date: formData.birthDate,
                    birthplace: formData.birthplace,
                    address: formData.address,
                    matricula: formData.matricula,
                    role: formData.role,
                    email_institutional: formData.emailInstitutional,
                    email_personal: formData.emailPersonal,
                    phone_fixed: formData.phoneFixed,
                    phone_mobile: formData.phoneMobile,
                    affiliation_type: formData.affiliationType,
                    terms_accepted: formData.termsAccepted
                }]);

            if (supabaseError) throw supabaseError;

            // 2. Enviar via FormSubmit (Email)
            // Para fazer o envio sem redirecionar a página, podemos usar fetch
            const emailBody = {
                _subject: `Nova Solicitação de Filiação: ${formData.fullName}`,
                _template: 'table',
                _captcha: 'false',
                ...formData
            };

            await fetch('https://formsubmit.co/ajax/auditores.sindical.tce.pe@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailBody)
            });

            // 3. Sucesso
            navigate('/associe-se/sucesso', { state: { name: formData.fullName, type: formData.affiliationType } });

        } catch (err: any) {
            console.error(err);
            setError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato direto via e-mail.');
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Como no RG" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                <input name="cpf" value={formData.cpf} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="000.000.000-00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                                <input name="rg" value={formData.rg} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Órgão Emissor" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                                <input name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Naturalidade</label>
                                <input name="birthplace" value={formData.birthplace} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Cidade - UF" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-20" placeholder="Rua, número, complemento, bairro, cidade e CEP" />
                            </div>
                        </div>
                        <button onClick={nextStep} className="w-full bg-primary-900 text-white font-bold py-3 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2">
                            Avançar <ArrowRight size={18} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula TCE-PE</label>
                                <input name="matricula" value={formData.matricula} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Ex: 12345" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                                    <option>Auditor de Controle Externo</option>
                                    <option>Auditor de Controle Externo (Obras)</option>
                                    <option>Auditor de Controle Externo (TI)</option>
                                    <option>Auditor de Controle Externo (Saúde)</option>
                                    <option>Analista de Controle Externo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Institucional</label>
                                <input name="emailInstitutional" type="email" value={formData.emailInstitutional} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="seuemail@tce.pe.gov.br" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Particular</label>
                                <input name="emailPersonal" type="email" value={formData.emailPersonal} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="seuemail@pessoal.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Fixo (Opcional)</label>
                                <input name="phoneFixed" value={formData.phoneFixed} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="(81) 0000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Celular / WhatsApp</label>
                                <input name="phoneMobile" value={formData.phoneMobile} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="(81) 90000-0000" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft size={18} /> Voltar
                            </button>
                            <button onClick={nextStep} className="flex-1 bg-primary-900 text-white font-bold py-3 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2">
                                Avançar <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 italic text-sm text-blue-900">
                            Ao se filiar, você fortalece as prerrogativas da carreira de Auditor de Controle Externo e garante acesso a assessoria jurídica e convênios exclusivos.
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

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                           <div className="flex items-start gap-3">
                               <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500" required />
                               <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                                   Solicito a minha inclusão conforme selecionado acima e **autorizo o débito da contribuição mensal** em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. Declaro estar ciente e de acordo com as regras estatutárias das entidades.
                               </label>
                           </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                                Voltar
                            </button>
                            <button onClick={handleSubmit} disabled={loading || !formData.termsAccepted} className="flex-2 grow bg-secondary-500 text-primary-900 font-bold py-3 rounded-lg hover:bg-secondary-600 transition-all shadow-md flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Confirmar Filiação Digital</>}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                
                {/* Intro Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Filiação Online</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Preencha seus dados para ingressar como membro das entidades representativas dos Auditores do TCE-PE.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Stepper Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 1 ? <Check size={20} /> : '1'}
                                </div>
                                <span className="font-bold text-sm hidden lg:block">Pessoal</span>
                            </div>
                            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 2 ? <Check size={20} /> : '2'}
                                </div>
                                <span className="font-bold text-sm hidden lg:block">Profissional</span>
                            </div>
                            <div className={`flex items-center gap-3 ${step >= 3 ? 'text-primary-700' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= 3 ? 'bg-primary-100 border-primary-600' : 'bg-gray-50 border-gray-200'}`}>
                                    {step > 3 ? <Check size={20} /> : '3'}
                                </div>
                                <span className="font-bold text-sm hidden lg:block">Filiação</span>
                            </div>
                        </div>
                        
                        <div className="hidden lg:block bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-800 text-sm mb-3">Dúvidas?</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Suas informações estão seguras e serão utilizadas exclusivamente para o cadastro institucional.
                            </p>
                        </div>
                    </div>

                    {/* Form Component */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
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