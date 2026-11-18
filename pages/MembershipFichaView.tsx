import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Printer, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface MembershipData {
    full_name: string;
    cpf: string;
    rg: string;
    birth_date: string;
    birthplace: string;
    address: string;
    matricula: string;
    role: string;
    email_institutional: string;
    email_personal: string;
    phone_fixed: string;
    phone_mobile: string;
    affiliation_type: string;
    is_retired: boolean;
    created_at: string;
}

const MembershipFichaView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // 1. Consulta segura por UUID exato via RPC (sem permitir listagem da tabela)
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_membership_application_by_id', {
                    p_id: id
                });

                if (!rpcError) {
                    if (!rpcData) {
                        throw new Error('Ficha não encontrada.');
                    }
                    setData(rpcData as MembershipData);
                    return;
                }

                // 2. Fallback compatível caso o script SQL ainda não tenha sido aplicado no banco
                const { data: appData, error: fetchError } = await supabase
                    .from('membership_applications')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                setData(appData);
            } catch (err: any) {
                console.error(err);
                setError('Não foi possível localizar a ficha de filiação. Verifique se o link está correto.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = () => window.print();

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

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center border border-red-100">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Ficha não encontrada</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/" className="inline-block bg-primary-900 text-white font-bold py-2 px-6 rounded-lg">
                        Voltar para o Início
                    </Link>
                </div>
            </div>
        );
    }

    const docDate = getDocumentDate(data.created_at);

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center print:p-0 print:bg-white print:min-h-0">
            
            {/* Admin Toolbar (Hidden on print) */}
            <div className="no-print print:hidden w-full max-w-4xl flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-primary-700 font-medium">
                    <ArrowLeft size={18} /> Sair da Visualização
                </Link>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-primary-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800 transition-all shadow-md"
                >
                    <Printer size={18} /> Imprimir Ficha Oficial
                </button>
            </div>

            {/* PRINTABLE FORM */}
            <div className="bg-white p-10 text-black font-serif max-w-4xl w-full shadow-2xl border-2 border-slate-200 printable-form">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase mb-1">Formulário de Admissão de Membro</h1>
                    <p className="text-base">Associação e Sindicato dos Auditores de Controle Externo do TCE-PE</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-100 p-2 font-bold uppercase text-sm border-y border-black">1. Dados Pessoais</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm leading-relaxed">
                        <div className="col-span-2"><span className="font-bold">Nome Completo:</span> {data.full_name}</div>
                        <div><span className="font-bold">CPF:</span> {data.cpf}</div>
                        <div><span className="font-bold">RG:</span> {data.rg}</div>
                        <div><span className="font-bold">Data de Nascimento:</span> {formatDate(data.birth_date)}</div>
                        <div><span className="font-bold">Naturalidade:</span> {data.birthplace}</div>
                        <div className="col-span-2"><span className="font-bold">Endereço Residencial:</span> {data.address}</div>
                    </div>

                    <div className="bg-slate-100 p-2 font-bold uppercase text-sm border-y border-black">2. Dados Funcionais e Contato</div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-sm leading-relaxed">
                        <div><span className="font-bold">Matrícula TCE-PE:</span> {data.matricula}</div>
                        <div><span className="font-bold">Cargo Atual:</span> {data.role}</div>
                        <div><span className="font-bold">E-mail Institucional:</span> {data.email_institutional}</div>
                        <div><span className="font-bold">E-mail Particular:</span> {data.email_personal || 'N/A'}</div>
                        <div><span className="font-bold">Telefone Fixo:</span> {data.phone_fixed || 'N/A'}</div>
                        <div><span className="font-bold">Celular / WhatsApp:</span> {data.phone_mobile}</div>
                        <div className="col-span-2"><span className="font-bold">Situação Funcional:</span> {data.is_retired ? 'Aposentado' : 'Auditores na Ativa'}</div>
                    </div>

                    <div className="bg-slate-100 p-2 font-bold uppercase text-sm border-y border-black">3. Filiação Solicitada</div>
                    <div className="text-sm italic px-2">
                        <span className="font-bold">Entidade(s) para Adesão:</span> {getFullAffiliationName(data.affiliation_type)}
                    </div>

                    <div className="mt-6 p-5 border border-black text-xs leading-6">
                        <p className="mb-4">
                            Solicito a minha inclusão conforme selecionado acima e <span className="font-bold underline">autorizo o débito da contribuição mensal</span> em minha conta corrente ou por desconto direto em meus vencimentos na folha de pagamento do TCE-PE. Declaro estar ciente e de acordo com as regras estatutárias das entidades representativas, as quais tive prévio conhecimento.
                        </p>
                        <div className="flex justify-between items-end mt-12 px-4">
                            <div>
                                <p className="text-sm font-medium">Recife - PE, {docDate.day} de {docDate.month} de {docDate.year}</p>
                            </div>
                            <div className="text-center w-72 border-t border-black pt-2">
                                <p className="text-sm font-bold uppercase">Assinatura do Membro</p>
                                <p className="text-[11px] text-gray-500 mt-1">{data.full_name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-[10px] text-gray-500 text-center border-t border-slate-200 pt-3">
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
