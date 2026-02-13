import React from 'react';
import { Scale, Gavel, FileText, Calendar, Mail, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Legal: React.FC = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: <Scale size={32} className="text-secondary-500" />,
            title: "Consultoria Jurídica",
            description: "Orientação preventiva e análise de questões administrativas, constitucionais e previdenciárias de interesse da categoria."
        },
        {
            icon: <Gavel size={32} className="text-secondary-500" />,
            title: "Defesa Judicial Coletiva",
            description: "Atuação estratégica em ações coletivas e Mandados de Segurança para garantia de direitos e prerrogativas dos auditores."
        },
        {
            icon: <FileText size={32} className="text-secondary-500" />,
            title: "Pareceres Técnicos",
            description: "Elaboração de estudos e notas técnicas para fundamentar a defesa da carreira junto aos órgãos competentes."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-primary-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6">
                        <Scale size={48} className="text-secondary-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Departamento Jurídico</h1>
                    <p className="text-xl text-primary-200 max-w-2xl mx-auto">
                        Defesa intransigente das prerrogativas e direitos dos Auditores de Controle Externo.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-secondary-500">
                            <div className="mb-4">{service.icon}</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Information & Contact Split */}
            <div className="container mx-auto px-4 py-8 mb-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Info */}
                    <div className="lg:w-2/3">
                        <h2 className="text-3xl font-bold text-primary-900 mb-6 border-l-4 border-secondary-500 pl-4">
                            Atuação e Escritórios Parceiros
                        </h2>
                        <p className="text-gray-700 mb-6 text-lg">
                            A associação mantém convênio com escritórios de advocacia renomados, especializados em Direito Público e Administrativo, garantindo uma defesa técnica de excelência para seus filiados.
                        </p>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Plantão Jurídico</h3>
                            <p className="text-gray-600 mb-4">
                                Os atendimentos presenciais ou virtuais com os advogados ocorrem semanalmente, mediante agendamento prévio.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="text-primary-600" size={20} />
                                    <span>Quartas-feiras, das 14h às 17h</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">V</div>
                                    <span>Atendimento Virtual (Google Meet / Zoom)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Nota Importante</h3>
                            <p className="text-blue-800 text-sm">
                                Para ações individuais que não envolvam interesses coletivos da categoria, consultar a tabela de honorários diferenciada do convênio.
                            </p>
                        </div>
                    </div>

                    {/* Right: Contact Card */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Fale com o Jurídico</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1">E-mail</label>
                                    <a href="mailto:juridico@auditores-tcepe.org.br" className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium">
                                        <Mail size={20} />
                                        juridico@auditores-tcepe.org.br
                                    </a>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                                    <a href="https://wa.me/5581999999999" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium">
                                        <Phone size={20} />
                                        (81) 99999-9999
                                    </a>
                                </div>

                                <hr className="border-gray-100" />

                                <button
                                    onClick={() => window.location.href = 'mailto:juridico@auditores-tcepe.org.br?subject=Agendamento Jurídico'}
                                    className="w-full bg-secondary-500 text-primary-900 font-bold py-3 rounded-lg hover:bg-secondary-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    Solicitar Agendamento <ArrowRight size={20} />
                                </button>

                                <p className="text-xs text-gray-400 text-center mt-2">
                                    Responderemos em até 24 horas úteis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legal;
