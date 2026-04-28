import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { MapPin, Calendar, CheckCircle2, Loader2, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Conacon: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [matricula, setMatricula] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const { error } = await supabase
                .from('conacon_interest')
                .insert([{ name, email, matricula, phone }]);

            if (error) throw error;

            setSuccess(true);
            setName('');
            setEmail('');
            setMatricula('');
            setPhone('');
        } catch (error: any) {
            console.error('Erro ao salvar interesse:', error);
            setErrorMsg('Não foi possível registrar seu interesse no momento. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center">
                <img 
                    src="/news/conacon2026.png" 
                    alt="9º CONACON Curitiba" 
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-50"
                />
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-secondary-500/20 text-secondary-300 font-bold text-xs uppercase tracking-widest border border-secondary-500/30 mb-4 backdrop-blur-sm">
                        Evento Nacional
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                        9º CONACON
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-light drop-shadow-md">
                        Congresso Nacional dos Auditores de Controle Externo
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 -mt-10 md:-mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Content Left */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 md:p-10">
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">
                                Preparativos para Curitiba 2026
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary-100 text-primary-600 p-3 rounded-lg shrink-0">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 uppercase text-sm tracking-wide">Data</p>
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
                                        <p className="text-gray-600">Curitiba, PR<br/><span className="text-xs text-gray-500">(Ópera de Arame e Teatro Positivo)</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-lg prose-slate max-w-none text-gray-600 space-y-6">
                                <p>
                                    A Associação Nacional dos Auditores de Controle Externo dos Tribunais de Contas do Brasil (ANTC) anuncia o <strong>9º CONACON</strong>, o maior encontro da carreira de Controle Externo do país.
                                </p>
                                
                                <p>
                                    Nesta edição, sob o tema <em>"Auditoria de Controle Externo que transforma: impacto social e simetria constitucional"</em>, o evento reunirá especialistas, gestores públicos e auditores de todo o Brasil para debater os rumos da nossa atuação e os desafios para o fortalecimento do sistema de controle.
                                </p>

                                <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-r-xl my-8 text-left">
                                    <h3 className="font-bold text-primary-900 text-lg mb-2 flex items-center gap-2">
                                        <Info size={20} /> Vagas Institucionais e Participação
                                    </h3>
                                    <p className="text-primary-800 text-sm m-0 leading-relaxed">
                                        A Associação dos Auditores do TCE-PE tem o objetivo de pleitear junto ao Tribunal a disponibilização de vagas institucionais suficientes para garantir a participação ativa dos nossos filiados neste importante congresso.
                                    </p>
                                </div>

                                <p>
                                    Para que possamos embasar nosso pleito e organizar nossa delegação estadual, é fundamental medirmos o interesse da nossa base. Preencha o formulário ao lado e garanta que você receba todas as atualizações sobre o assunto em primeira mão.
                                </p>

                                <div className="pt-6">
                                    <a 
                                        href="https://conacon.com.br/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-secondary-600 font-bold hover:text-secondary-700 transition-colors"
                                    >
                                        Acessar o hotsite oficial da ANTC <ArrowRight size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Form Right */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-24">
                            {success ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Interesse Registrado!</h3>
                                    <p className="text-gray-500 text-sm">
                                        Obrigado por manifestar seu interesse. Em breve a Diretoria entrará em contato com mais detalhes sobre o evento.
                                    </p>
                                    <button 
                                        onClick={() => setSuccess(false)}
                                        className="mt-6 text-sm text-primary-600 font-bold hover:underline"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-slate-800">Vamos a Curitiba?</h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Preencha os dados abaixo para fortalecer nosso pleito institucional.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {errorMsg && (
                                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                                                {errorMsg}
                                            </div>
                                        )}

                                        <div>
                                            <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                            <input 
                                                type="text" 
                                                id="name"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                                placeholder="Seu nome"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="matricula" className="block text-xs font-bold text-gray-500 uppercase mb-1">Matrícula</label>
                                                <input 
                                                    type="text" 
                                                    id="matricula"
                                                    required
                                                    value={matricula}
                                                    onChange={(e) => setMatricula(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                                    placeholder="000.000"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                                <input 
                                                    type="tel" 
                                                    id="phone"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                                    placeholder="(81) 90000-0000"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                                            <input 
                                                type="email" 
                                                id="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-slate-50 focus:bg-white"
                                                placeholder="seu@email.com"
                                            />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Registrar Interesse'}
                                        </button>

                                        <p className="text-[10px] text-gray-400 text-center mt-4">
                                            *O preenchimento não garante inscrição no evento, servindo apenas para sondagem inicial de interesse.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                            <Link to="/" className="text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-2">
                                Voltar para a Página Inicial
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Conacon;
