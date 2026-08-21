import React from 'react';
import { MapPin, Calendar, ArrowRight, BookOpen, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Conacon: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Section */}
            <div className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden flex items-center justify-center">
                <img 
                    src="/news/tcepe-conacon2026.jpg" 
                    alt="Delegação do TCE-PE no 9º CONACON" 
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.4]"
                />
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-secondary-500/20 text-secondary-300 font-bold text-xs uppercase tracking-widest border border-secondary-500/30 mb-4 backdrop-blur-md">
                        Congresso Nacional — Curitiba (PR)
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                        9º CONACON
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-light drop-shadow-md">
                        Participação dos Auditores de Controle Externo do TCE-PE
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 -mt-12 md:-mt-16 relative z-20 max-w-5xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    
                    {/* Featured Photo Section */}
                    <div className="relative">
                        <img 
                            src="/news/tcepe-conacon2026.jpg" 
                            alt="Auditores do TCE-PE no 9º CONACON" 
                            className="w-full h-auto max-h-[520px] object-cover"
                        />
                        <div className="p-4 bg-slate-900 text-white text-xs md:text-sm italic text-center">
                            Delegação dos Auditores de Controle Externo do TCE-PE reunida durante a programação oficial do 9º CONACON em Curitiba (PR).
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">
                                Destaque Institucional
                            </span>
                            <span className="text-sm text-gray-400">18 a 21 de Agosto de 2026</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 leading-tight">
                            Auditores do TCE-PE Marcam Presença com Apresentações Científicas e Atuação Formulada no 9º CONACON
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-100 text-primary-600 p-3 rounded-lg shrink-0">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 uppercase text-sm tracking-wide">Data do Evento</p>
                                    <p className="text-gray-600">18 a 21 de Agosto de 2026</p>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px bg-slate-200"></div>
                            <div className="flex items-start gap-4">
                                <div className="bg-secondary-100 text-secondary-600 p-3 rounded-lg shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 uppercase text-sm tracking-wide">Local</p>
                                    <p className="text-gray-600">Curitiba, PR<br/><span className="text-xs text-gray-500">(Universidade Positivo e Ópera de Arame)</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-lg prose-slate max-w-none text-gray-600 space-y-6">
                            <p>
                                O <strong>9º Congresso Nacional dos Auditores de Controle Externo dos Tribunais de Contas do Brasil (CONACON)</strong> foi realizado em Curitiba (PR), reunindo a comunidade técnica de controle externo de todo o país sob o tema principal <em>“Auditoria de Controle Externo que transforma: impacto social e simetria constitucional”</em>.
                            </p>

                            <p>
                                A delegação dos Auditores de Controle Externo do Tribunal de Contas de Pernambuco (TCE-PE) teve atuação de destaque na programação científica, nos painéis de debates e nos fóruns temáticos sobre o fortalecimento da independência técnica e das atribuições constitucionais da carreira.
                            </p>

                            {/* Scientific Papers Section */}
                            <div className="bg-primary-50/70 p-6 md:p-8 rounded-xl border border-primary-100 my-8">
                                <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="text-primary-600" size={24} /> Trabalhos Científicos de Pernambuco Aprovados
                                </h3>
                                <p className="text-sm text-primary-800 mb-6">
                                    Dentre os artigos selecionados no edital nacional para exposição presencial no congresso, três estudos de autoria de auditores do TCE-PE foram apresentados na Universidade Positivo:
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-primary-100">
                                        <h4 className="font-bold text-slate-800 text-base mb-1">
                                            • Grau de maturidade da TI Verde nos Tribunais de Contas do Brasil: uma análise multidimensional das práticas sustentáveis em TI
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-2">
                                            <strong>Autores:</strong> Ana Carolina Chaves Machado de Morais, Francisco José Almeida de Oliveira, Ricardo Jorge Veras Beltrão, Joas Tomaz de Aquino e Fagner José Coutinho de Melo.
                                        </p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-primary-100">
                                        <h4 className="font-bold text-slate-800 text-base mb-1">
                                            • Governança de IA e de TI Verde no setor público pernambucano: um diagnóstico a partir do iGovTI-TCE-PE 2025
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-2">
                                            <strong>Autores:</strong> Obed Leite Vieira, Vanessa Hirakawa Martins e Halmos Fernando do Nascimento.
                                        </p>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-primary-100">
                                        <h4 className="font-bold text-slate-800 text-base mb-1">
                                            • Políticas públicas de benefícios fiscais: uma avaliação da eficácia do Prodepe na geração de empregos
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-2">
                                            <strong>Autores:</strong> Violeta Morato Figueirêdo Régis de Carvalho, Lidyanne Costa de Araújo, Raquel Vasconcelos de Figueirôa Gonçalves, Diogo Jonathan Mattheus de Melo Santos e Ivan Orquiza.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-xl my-8">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-secondary-400">
                                    <Award size={22} /> Fortalecimento da Carreira de Estado
                                </h3>
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed m-0">
                                    A participação expressiva da base pernambucana reforça o papel fundamental do Auditor de Controle Externo na indução de políticas públicas eficientes e na defesa da independência soberana do relatório de auditoria técnica.
                                </p>
                            </div>

                            <div className="pt-6 flex flex-wrap gap-4 items-center justify-between border-t border-gray-100">
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold transition-colors"
                                >
                                    <ArrowLeft size={18} /> Voltar para a Página Inicial
                                </Link>

                                <div className="flex items-center gap-4">
                                    <Link 
                                        to="/news/tce-pe-no-9-conacon-curitiba-2026" 
                                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                                    >
                                        Ler Matéria Completa <ArrowRight size={18} />
                                    </Link>

                                    <a 
                                        href="https://conacon.com.br/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-secondary-600 font-bold hover:text-secondary-700 transition-colors"
                                    >
                                        Hotsite Oficial <ArrowRight size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Conacon;
