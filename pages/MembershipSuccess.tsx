import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Printer, Mail } from 'lucide-react';

interface MembershipState {
    fullName: string;
    cpf: string;
    rg: string;
    birthDate: string;
    birthplace: string;
    address: string;
    matricula: string;
    role: string;
    emailInstitutional: string;
    emailPersonal: string;
    phoneFixed: string;
    phoneMobile: string;
    affiliationType: string;
    termsAccepted: boolean;
}

const MembershipSuccess: React.FC = () => {
    const location = useLocation();
    const state = location.state as MembershipState | null;

    if (!state) {
        return <Navigate to="/associe-se" />;
    }

    const handlePrint = () => {
        window.print();
    };

    const getTodayDetails = () => {
        const today = new Date();
        return {
            day: today.getDate(),
            month: today.toLocaleString('pt-BR', { month: 'long' }),
            year: today.getFullYear()
        };
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const today = getTodayDetails();

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4">
            <div className="max-w-3xl mx-auto no-print">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    
                    {/* Top Accent */}
                    <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-500"></div>

                    <div className="p-8 md:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                            <CheckCircle size={40} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Solicitação Recebida!
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Olá, <span className="font-bold text-slate-800">{state.fullName}</span>! Sua solicitação de filiação foi registrada com sucesso.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-3 text-primary-700">
                                    <Mail size={20} />
                                    <h3 className="font-bold">Próximos Passos</h3>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-primary-500 font-bold">•</span>
                                        Nossa secretaria validará sua matrícula junto ao TCE-PE.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary-500 font-bold">•</span>
                                        Aguarde o e-mail de confirmação (até 48h úteis).
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-3 text-secondary-600">
                                    <Download size={20} />
                                    <h3 className="font-bold">Sua Ficha de Filiação</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Gere o documento oficial com seus dados para seu arquivo pessoal ou entrega física.
                                </p>
                                <button 
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center gap-2 bg-secondary-500 text-primary-900 py-3 rounded-lg text-sm font-bold hover:bg-secondary-600 transition-colors shadow-sm"
                                >
                                    <Printer size={18} /> Gerar Ficha para Impressão
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/" className="bg-primary-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-800 transition-all flex items-center justify-center gap-2">
                                Voltar para o Início
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* FORMULÁRIO PARA IMPRESSÃO (Visível apenas no print) */}
            <div className="only-print p-8 text-black bg-white font-serif max-w-4xl mx-auto border-2 border-black">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-xl font-bold uppercase">Formulário de Admissão de Membro</h1>
                    <p className="text-sm">Associação e Sindicato dos Auditores de Controle Externo do TCE-PE</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-100 p-2 font-bold uppercase text-sm border-y border-black">Dados Pessoais</div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="col-span-2"><span className="font-bold">Nome:</span> {state.fullName}</div>
                        <div><span className="font-bold">CPF:</span> {state.cpf}</div>
                        <div><span className="font-bold">RG:</span> {state.rg}</div>
                        <div><span className="font-bold">Data de Nascimento:</span> {formatDate(state.birthDate)}</div>
                        <div><span className="font-bold">Naturalidade:</span> {state.birthplace}</div>
                        <div className="col-span-2"><span className="font-bold">Endereço:</span> {state.address}</div>
                    </div>

                    <div className="bg-gray-100 p-2 font-bold uppercase text-sm border-y border-black">Dados Funcionais e Contato</div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div><span className="font-bold">Matrícula TCE-PE:</span> {state.matricula}</div>
                        <div><span className="font-bold">Cargo:</span> {state.role}</div>
                        <div><span className="font-bold">E-mail Institucional:</span> {state.emailInstitutional}</div>
                        <div><span className="font-bold">E-mail Particular:</span> {state.emailPersonal}</div>
                        <div><span className="font-bold">Telefone Fixo:</span> {state.phoneFixed || 'N/A'}</div>
                        <div><span className="font-bold">Celular:</span> {state.phoneMobile}</div>
                    </div>

                    <div className="bg-gray-100 p-2 font-bold uppercase text-sm border-y border-black">Filiação Solicitada</div>
                    <div className="text-sm italic">
                        <span className="font-bold">Entidade(s):</span> {
                            state.affiliationType === 'Ambos' 
                            ? 'Associação dos Auditores de Controle Externo do TCE-PE e Sindicato dos Auditores do TCE-PE'
                            : state.affiliationType === 'Associação'
                            ? 'Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco'
                            : 'Sindicato dos Auditores do Tribunal de Contas do Estado de Pernambuco'
                        }
                    </div>

                    <div className="mt-10 p-4 border border-black text-xs leading-relaxed">
                        <p className="mb-4">
                            Solicito a minha inclusão conforme selecionado acima e <span className="font-bold underline">autorizo o débito da contribuição mensal</span> em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. Declaro estar ciente e de acordo com as regras estatutárias das entidades representativas.
                        </p>
                        <div className="flex justify-between items-end mt-12">
                            <div>
                                <p>Recife - PE, {today.day} de {today.month} de {today.year}</p>
                            </div>
                            <div className="text-center w-64 border-t border-black pt-2">
                                <p>Assinatura do Membro</p>
                                <p className="text-[10px] text-gray-500">{state.fullName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-[10px] text-gray-400 text-center">
                        Documento gerado digitalmente em {new Date().toLocaleString('pt-BR')} - {state.cpf}
                    </div>
                </div>
            </div>

            <style>{`
                /* Hide print layout in standard view */
                .only-print { display: none; }

                @media print {
                    /* Hide site elements */
                    nav, footer, .no-print { display: none !important; }
                    
                    /* Show print element */
                    .only-print { 
                        display: block !important;
                        visibility: visible;
                    }

                    body {
                        background: white !important;
                        margin: 0;
                        padding: 0;
                    }

                    /* Reset container styles for print */
                    .min-h-screen { 
                        padding: 0 !important;
                        background: white !important;
                    }

                    @page {
                        margin: 1.5cm;
                        size: auto;
                    }

                    footer, .no-print {
                        display: none !important;
                    }

                    html, body {
                        height: auto !important;
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MembershipSuccess;
