import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Printer, Mail } from 'lucide-react';

const MembershipSuccess: React.FC = () => {
    const location = useLocation();
    const state = location.state as { name: string; type: string } | null;

    if (!state) {
        return <Navigate to="/associe-se" />;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    
                    {/* Top Accent */}
                    <div className="h-2 bg-gradient-to-r from-primary-600 to-secondary-500"></div>

                    <div className="p-8 md:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                            <CheckCircle size={40} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Solicitação Recebida com Sucesso!
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Olá, <span className="font-bold text-slate-800">{state.name}</span>! Sua proposta de filiação como 
                            <span className="font-bold text-primary-700"> {state.type}</span> foi registrada em nosso sistema.
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
                                        Nossa secretaria vai conferir seus dados funcionais junto ao TCE-PE.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary-500 font-bold">•</span>
                                        Você receberá um e-mail de confirmação em até 48 horas úteis.
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary-500 font-bold">•</span>
                                        Após a aprovação, seu acesso à Área do Filiado será liberado.
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center gap-3 mb-3 text-secondary-600">
                                    <Download size={20} />
                                    <h3 className="font-bold">Cópia da Ficha</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Recomendamos que salve ou imprima uma cópia dos dados enviados para seu controle.
                                </p>
                                <button 
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Printer size={16} /> Imprimir Resumo
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/" 
                                className="bg-primary-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-800 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Voltar para o Início
                            </Link>
                            <Link 
                                to="/news" 
                                className="bg-white text-primary-900 font-bold py-3 px-8 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                Ver Notícias <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-900 text-slate-400 p-6 text-center text-xs">
                        Qualquer dúvida, entre em contato através do e-mail: 
                        <a href="mailto:auditores.sindical.tce.pe@gmail.com" className="text-primary-400 hover:underline ml-1">
                            auditores.sindical.tce.pe@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    nav, footer, button, .no-print { display: none !important; }
                    .min-h-screen { py-0; background: white; }
                    .max-w-3xl { max-width: 100%; border: none; shadow: none; }
                    .rounded-3xl { border-radius: 0; }
                    .bg-slate-50 { background: white; }
                }
            `}</style>
        </div>
    );
};

export default MembershipSuccess;
