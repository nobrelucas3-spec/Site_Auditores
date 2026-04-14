import React, { useState, useEffect } from 'react';
import { BookOpen, Share2, Printer, ChevronRight, User, Calendar, Clock, X, List } from 'lucide-react';
import { SectionHeader, Paragraph, PullQuote, InfoBox } from '../components/ArticleComponents';

interface Section {
    id: string;
    title: string;
}

const ArticleCalicesPrivilegio: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('intro');
    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

    const sections: Section[] = [
        { id: 'intro', title: 'A Metáfora da Hidráulica Social' },
        { id: 'controle-performance', title: 'O Vies do Controle de Performance' },
        { id: 'fraude', title: 'O DNA do Desvio no Brasil' },
        { id: 'tecnologia', title: 'A Sobriedade Tecnológica' },
        { id: 'conclusao', title: 'Conclusão' },
    ];

    // Simple scroll spy to update active section
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
            setIsMobileTocOpen(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Cálices de privilégio e copos de plástico',
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado!');
        }
    };

    return (
        <div className="bg-[#f8f9fa] text-slate-900 font-sans relative">

            {/* Mobile TOC Button (Floating) */}
            <button
                onClick={() => setIsMobileTocOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-900 text-white p-4 rounded-full shadow-lg hover:bg-primary-800 focus:outline-none transition-transform active:scale-95 flex items-center justify-center"
                aria-label="Índice do Artigo"
            >
                <List size={24} />
            </button>

            {/* Mobile TOC Overlay */}
            <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${isMobileTocOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileTocOpen(false)} />

            {/* Mobile TOC Drawer */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileTocOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 text-primary-900">
                            <BookOpen className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Índice</h3>
                        </div>
                        <button onClick={() => setIsMobileTocOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <ul className="space-y-4">
                            {sections.map(section => (
                                <li key={section.id} className="relative pl-4 border-l-2 border-transparent hover:border-secondary-500 transition-colors">
                                    <button
                                        onClick={() => scrollToSection(section.id)}
                                        className={`text-sm text-left w-full transition-colors duration-200 ${activeSection === section.id
                                            ? 'text-primary-900 font-bold'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <main className="container mx-auto py-12 px-4 lg:px-8 flex gap-12">

                {/* Main Content Column */}
                <article className="lg:w-2/3 max-w-3xl">

                    {/* Header */}
                    <header className="mb-12">
                        <div className="inline-block bg-sky-100 text-primary-900 text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide mb-4 border border-sky-200">
                            Artigo de Opinião
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight mb-6 mt-2">
                            Cálices de privilégio e copos de plástico: quando o macro ignora o ralo da execução
                        </h1>
                        <p className="text-xl text-gray-600 font-serif leading-relaxed mb-8 border-l-4 border-secondary-500 pl-4">
                            O Estado brasileiro pode ser perfeitamente compreendido através da metáfora da "hidráulica social". Imagine o erário, o recurso público oriundo dos pesados tributos, como uma imensa caixa d'água.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary-800" />
                                <span className="font-medium text-primary-800">Rafael Barbosa Brito da Matta</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>14 de Abril, 2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>6 min de leitura</span>
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full transition text-primary-800"><Share2 className="w-4 h-4" /></button>
                                <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-full transition text-primary-800"><Printer className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </header>

                    <section>
                        <SectionHeader title="1. A Metáfora da Hidráulica Social" id="intro" />
                        <Paragraph className="drop-cap first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-black first-letter:text-primary-900">
                            O Estado brasileiro pode ser perfeitamente compreendido através da metáfora da "hidráulica social". Imagine o erário, o recurso público oriundo dos pesados tributos pagos pela sociedade, como uma imensa caixa d'água. Desse reservatório central, partem as tubulações estruturais que representam as diretrizes governamentais, culminando nas torneiras que chamamos de políticas públicas.
                        </Paragraph>
                        <Paragraph>
                            Na ponta final desse intrincado sistema, sob um sol escaldante de desigualdade, aguarda o cidadão comum, segurando o seu frágil copo de plástico, na esperança de que alguma gota de dignidade chegue até ele.
                        </Paragraph>
                        <Paragraph>
                            No entanto, a água raramente chega com a quantidade, a pressão ou a pureza prometidas. Isso ocorre porque a "velha política" e os consórcios de interesses privados são especialistas em engenharia furtiva. Ao longo da tubulação burocrática, instalam-se sofisticados "ramais de desvio" técnicos. São aditivos contratuais obscuros, licitações direcionadas com rigor formal e atestados de recebimento forjados. Antes que a torneira da política pública pingue no copo de plástico do cidadão, a água já foi drenada em abundância para encher os reluzentes cálices de privilégio de uma elite incrustada no poder.
                        </Paragraph>
                    </section>

                    <section>
                        <SectionHeader title="2. O Vies do Controle de Performance" id="controle-performance" />
                        <Paragraph>
                            Diante dessa sangria estrutural, o sistema de controle externo brasileiro — capitaneado pelos Tribunais de Contas — tem passado por uma transição paradigmática. Há um movimento sedutor e perigoso de abandono gradual da fiscalização de conformidade tradicional (o olhar sobre o contrato, a licitação e a nota fiscal) em prol do chamado "controle de performance" ou avaliação de políticas públicas. Embora a modernização rumo ao controle de resultados seja uma evolução necessária para a accountability estatal, ela se converte em um erro estratégico de proporções calamitosas se desguarnecer a fiscalização da ponta.
                        </Paragraph>
                    </section>

                    <section>
                        <SectionHeader title="3. O DNA do Desvio no Brasil" id="fraude" />
                        <Paragraph>
                            Para compreender o porquê, precisamos olhar para o DNA do desvio no Brasil. A fraude na execução dos contratos não é uma anomalia recente ou uma falha acidental de percurso; ela é o pilar sobre o qual se assenta a nossa governabilidade fisiológica.
                        </Paragraph>
                        <Paragraph>
                            O sociólogo Raymundo Faoro, ao descrever o nosso "estamento burocrático", demonstrou como uma casta se apropria do aparelho de Estado para geri-lo como um negócio privado. Simultaneamente, o "homem cordial" de Sérgio Buarque de Holanda nos ensina que, historicamente, o brasileiro rejeita a impessoalidade da lei em favor dos laços de compadrio e da confusão deletéria entre o público e o privado. O patrimonialismo não opera em teses macroeconômicas; ele opera no detalhe, na execução, na margem do contrato. A fraude sempre esteve e continuará estando na ponta. O risco iminente é o auditor parar de olhar para ela.
                        </Paragraph>
                        <Paragraph>
                            A gravidade dessa inversão de prioridades ganha contornos dramáticos quando confrontada com evidências empíricas. Conforme demonstram estudos sobre fiscalização dual — que analisam casos onde órgãos de controle auditam simultaneamente o mesmo objeto —, um dado recente e alarmante revela que a convergência de achados entre o olhar "macro" dos Tribunais de Contas e o olhar "micro" (de execução) da Controladoria-Geral da União é de ínfimos 0,37%. Essa discrepância metodológica não é apenas uma curiosidade estatística; é o atestado de uma miopia institucional.
                        </Paragraph>
                        <PullQuote text="É a consagração do cinismo administrativo: aprova-se o balanço porque a 'política pública' atingiu a meta no papel, fechando os olhos para o fato de que a escola não tem teto..." />
                        <Paragraph>
                            O que essa assimetria de parcos 0,37% nos diz? Diz que os auditores de controle externo, ao focarem exclusivamente em painéis de indicadores e na "maturidade da gestão", correm o risco gravíssimo de chancelar contas de governos que entregam planilhas irretocáveis, enquanto, no mundo real, os contratos de merenda escolar, fornecimento de medicamentos e obras de infraestrutura continuam sendo brutalmente drenados.
                        </Paragraph>
                    </section>

                    <section>
                        <SectionHeader title="4. A Sobriedade Tecnológica e a Auditoria de Riscos" id="tecnologia" />
                        <Paragraph>
                            Neste ponto, os defensores da modernização a qualquer custo costumam evocar a salvação tecnológica. Ferramentas de inteligência artificial, como a excelente "Alice" desenvolvida no âmbito da CGU e o ChatTCU do Tribunal de Contas da União, são frequentemente citadas como substitutas da auditoria de campo. É inegável que a IA é formidável para varrer diários oficiais, cruzar CNPJs e detectar a chamada "blindagem formal". Ela encontra o erro no papel com uma velocidade inumana.
                        </Paragraph>
                        <Paragraph>
                            Contudo, precisamos de sobriedade tecnológica: nenhuma IA, por mais avançada que seja, tem a capacidade de verificar a espessura da capa asfáltica de uma rodovia recém-inaugurada. Nenhum algoritmo entra em um almoxarifado no interior do país para contar caixas de insulina ou verificar se a merenda entregue é composta de carne ou de charque estragado. A materialidade da fraude exige a presença física, o olhar treinado, a sola de sapato gasta. Exige o auditor de campo.
                        </Paragraph>
                        <Paragraph>
                            Cai-se, assim, naquilo que podemos chamar de armadilha da auditoria de riscos. O Brasil vive uma obsessão por importar metodologias de países de altíssima maturidade institucional — muitas vezes pautadas em diretrizes de organismos internacionais como a Organização para a Cooperação e Desenvolvimento Econômico (OCDE) — e aplicá-las, sem filtros, em realidades de indigência administrativa.
                        </Paragraph>
                        <InfoBox title="A Armadilha de Importar Metodologias">
                            <p>É um delírio gerencial exigir auditorias de performance nos moldes escandinavos em municípios que sequer possuem um sistema de contabilidade básica funcional ou um portal da transparência que não seja uma mera vitrine de links quebrados. Nesses contextos de baixa maturidade, a auditoria de resultados descolada da conformidade degenera-se rapidamente em "teatro burocrático".</p>
                        </InfoBox>
                    </section>

                    <section className="mb-20">
                        <SectionHeader title="5. Conclusão" id="conclusao" />
                        <Paragraph>
                            A conclusão a que se chega não é um chamado ao retrocesso ou um apego nostálgico à caça de carimbos e notas fiscais de baixo valor. A avaliação de políticas públicas deve, indubitavelmente, ser o teto da atuação dos Tribunais de Contas, norteando o planejamento estratégico do Estado e avaliando o retorno social do imposto arrecadado. Contudo, a rigorosa fiscalização de contratos e da execução da despesa permanece sendo o alicerce insubstituível.
                        </Paragraph>
                        <Paragraph>
                            O que se impõe é a adoção de um modelo híbrido, implacável e inteligente. Um modelo que use a tecnologia para mapear o risco e a auditoria de políticas públicas para entender o cenário, mas que jamais abra mão de enviar o seu corpo técnico aos rincões da administração para checar a entrega real. O Auditor de Controle Externo, atuando na "ponta da lança", não é um mero burocrata; ele é a última barreira de defesa da moralidade administrativa.
                        </Paragraph>
                        <Paragraph>
                            Se abdicarmos dessa trincheira em nome de uma modernidade estatística estéril, continuaremos a encher os cálices de privilégio dos mesmos estamentos de sempre. E o cidadão, do lado de fora das cortes e dos relatórios sofisticados, continuará segurando o seu copo de plástico vazio, esperando por uma água que, no papel, consta como entregue.
                        </Paragraph>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-sm font-bold text-gray-700">Por Rafael Barbosa Brito da Matta</p>
                            <p className="text-sm text-gray-500">Auditor de Controle Externo do TCE-PE</p>
                            <p className="text-xs text-gray-400 mt-2">Artigo originalmente publicado no site Jota ou associados ANTC.</p>
                        </div>
                    </section>
                </article>

                {/* Sidebar / TOC */}
                <aside className="hidden lg:block w-1/3">
                    <div className="sticky top-32 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-primary-900">
                            <BookOpen className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Índice do Artigo</h3>
                        </div>

                        <ul className="space-y-3 relative">
                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                            {sections.map(section => (
                                <li key={section.id} className="relative pl-6">
                                    {activeSection === section.id && (
                                        <span className="absolute left-[4px] top-1.5 w-2 h-2 rounded-full bg-secondary-500 ring-4 ring-white"></span>
                                    )}
                                    <button
                                        onClick={() => scrollToSection(section.id)}
                                        className={`text-sm text-left transition-colors duration-200 ${activeSection === section.id
                                            ? 'text-primary-900 font-bold'
                                            : 'text-gray-500 hover:text-secondary-600'
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

            </main>
        </div>
    );
};

export default ArticleCalicesPrivilegio;
