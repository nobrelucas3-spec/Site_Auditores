import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Share2, Printer, ChevronRight, User, Calendar, Clock, Menu, X, List, Loader, MessageCircle, Instagram, Twitter, Linkedin, Copy, Scale, FileText } from 'lucide-react';
import { SectionHeader, SubSectionHeader, Paragraph, PullQuote, InfoBox, ComparisonTable } from '../components/ArticleComponents';
import { supabase } from '../services/supabaseClient';

interface Section {
    id: string;
    title: string;
}

const ArticleTetoRemuneratorio: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string>('intro');
    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const sections: Section[] = [
        { id: 'intro', title: 'Introdução' },
        { id: 'contexto', title: 'Contexto Legislativo' },
        { id: 'adi', title: 'ADI 7937 e Argumentos' },
        { id: 'paradigma', title: 'Paradigma do TCE-PE' },
        { id: 'luta', title: 'Luta Associativa' },
        { id: 'evolucao', title: 'Evolução Constitucional' },
        { id: 'presuncao', title: 'Presunção de Validade' },
        { id: 'relator', title: 'Perfil do Relator' },
        { id: 'conclusao', title: 'Considerações Finais' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 250;
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

    const handlePrint = () => window.print();

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const title = 'A Unificação do Teto Remuneratório em Pernambuco';
        switch (platform) {
            case 'whatsapp': window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + url)}`, '_blank'); break;
            case 'instagram': window.open(`https://www.instagram.com/`, '_blank'); break;
            case 'copy': navigator.clipboard.writeText(url); alert('Link copiado!'); break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] text-slate-900 font-sans relative">
            {/* Mobile TOC Button */}
            <button
                onClick={() => setIsMobileTocOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-900 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
            >
                <List size={24} />
            </button>

            {/* Mobile TOC Overlay & Drawer */}
            <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${isMobileTocOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileTocOpen(false)} />
            <div className={`fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileTocOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 text-primary-900">
                            <BookOpen className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Índice</h3>
                        </div>
                        <button onClick={() => setIsMobileTocOpen(false)} className="text-gray-400"><X size={24} /></button>
                    </div>
                    <ul className="space-y-4">
                        {sections.map(section => (
                            <li key={section.id}>
                                <button
                                    onClick={() => scrollToSection(section.id)}
                                    className={`text-sm text-left w-full ${activeSection === section.id ? 'text-primary-900 font-bold' : 'text-gray-600'}`}
                                >
                                    {section.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <main className="container mx-auto py-12 px-4 lg:px-8 flex gap-12">
                {/* Main Content */}
                <article className="lg:w-2/3 max-w-3xl">
                    <header className="mb-12">
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest mb-4 border border-indigo-100">
                            Direito Constitucional e Administrativo
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight mb-6">
                            A Unificação do Teto Remuneratório em Pernambuco
                        </h1>
                        <p className="text-xl text-gray-600 font-serif leading-relaxed mb-8 border-l-4 border-secondary-500 pl-4 italic">
                            O Contexto da Emenda Constitucional 68/2025 e a ADI 7937
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                            <div className="flex items-center gap-2 font-medium">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">LN</div>
                                <span className="text-slate-800">Lucas Nobre - Auditor de Controle Externo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>15 de Maio de 2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>12 min de leitura</span>
                            </div>
                            <div className="flex items-center gap-4 ml-auto">
                                <button onClick={() => handleShare('whatsapp')} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"><MessageCircle size={18} /></button>
                                <button onClick={() => handleShare('instagram')} className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition"><Instagram size={18} /></button>
                                <button onClick={handlePrint} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"><Printer size={18} /></button>
                            </div>
                        </div>
                    </header>

                    {/* Section 1: Intro */}
                    <section id="intro">
                        <SectionHeader title="1. Introdução" id="intro" />
                        <Paragraph className="drop-cap first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-black first-letter:text-primary-900">
                            O cenário institucional e administrativo do Estado de Pernambuco encontra-se, no primeiro semestre de 2026, em um período de debates jurídicos e administrativos.
                        </Paragraph>
                        <Paragraph>
                            O foco deste debate é a promulgação da <strong>Emenda Constitucional Estadual nº 68, de 18 de dezembro de 2025</strong>, que promoveu uma reestruturação fundamental no sistema de limites remuneratórios para os servidores públicos civis do estado. A referida emenda, originada de uma Proposta de Emenda à Constituição (PEC) na Assembleia Legislativa de Pernambuco (Alepe), busca unificar o teto salarial do funcionalismo, adotando como paradigma o subsídio dos desembargadores do Tribunal de Justiça do Estado de Pernambuco (TJPE), o que, diante das recentes mutações constitucionais e decisões do Supremo Tribunal Federal (STF), equivale ao valor integral do subsídio dos ministros da Suprema Corte Federal.
                        </Paragraph>
                        <Paragraph>
                            Apesar da vigência plena da norma constitucional estadual, o Poder Executivo judicializou a questão por meio da Ação Direta de Inconstitucionalidade (ADI) 7937, protocolada junto ao STF. Este movimento gerou um hiato de implementação: enquanto órgãos dotados de autonomia financeira, como o Tribunal de Contas do Estado de Pernambuco (TCE-PE), já procedem ao pagamento de seus auditores de controle externo com base no novo teto, as categorias vinculadas ao Poder Executivo enfrentam uma barreira administrativa que impede a atualização de seus vencimentos.
                        </Paragraph>
                    </section>

                    {/* Section 2: Contexto Legislativo */}
                    <section id="contexto">
                        <SectionHeader title="2. O Contexto Legislativo da Emenda Constitucional 68/2025" id="contexto" />
                        <Paragraph>
                            A Emenda Constitucional nº 68/2025 não é um ato isolado, mas o ápice de um movimento de harmonização normativa que visa adequar Pernambuco à realidade federativa contemporânea. O texto alterou substancialmente o § 6º do art. 97 da Constituição Estadual, que anteriormente vinculava o teto ao limite de 90,25% do subsídio dos ministros do STF. Com a nova redação, a referência passa a ser o subsídio mensal dos desembargadores do TJPE, sem a menção explícita ao redutor percentual, abrangendo todos os poderes, o Ministério Público e o Tribunal de Contas.
                        </Paragraph>

                        <div className="my-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Tabela 1: Evolução Normativa do Teto Remuneratório em Pernambuco</h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Dispositivo</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Texto Anterior (EC 35/2013)</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Nova Redação (EC 68/2025)</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Implicação Prática</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-4 py-4 font-medium text-slate-900">Art. 97, § 6º</td>
                                            <td className="px-4 py-4">Limite fixado em 90,25% do subsídio dos ministros do STF.</td>
                                            <td className="px-4 py-4">Limite fixado pelo subsídio dos desembargadores do TJPE.</td>
                                            <td className="px-4 py-4 text-primary-700 font-bold">Elevação do teto para 100% do valor do STF.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-medium text-slate-900">Art. 131, § 7º, III</td>
                                            <td className="px-4 py-4">Vedação expressa ao pagamento de férias e licença-prêmio em pecúnia.</td>
                                            <td className="px-4 py-4 text-red-600">Inciso Revogado.</td>
                                            <td className="px-4 py-4 italic">Desconstitucionalização da matéria.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3 text-xs text-slate-500 italic text-center">Fonte: Elaboração baseada na Constituição do Estado de Pernambuco e petições da ANTC.</p>
                        </div>

                        <Paragraph>
                            A reestruturação proposta pela Alepe fundamenta-se na faculdade outorgada aos estados pelo § 12 do art. 37 da Constituição Federal, incluído pela Emenda Constitucional nº 47/2005. Este dispositivo permite que os estados instituam, mediante emenda às suas constituições, um limite remuneratório único. A lógica da "unicidade" é um pilar da eficiência administrativa, visando evitar que carreiras de igual importância para a estrutura do Estado sejam submetidas a "subtetos" desiguais, o que gera desestímulo e evasão de talentos para outras esferas da federação ou carreiras.
                        </Paragraph>
                    </section>

                    {/* Section 3: ADI 7937 */}
                    <section id="adi">
                        <SectionHeader title="3. A ADI 7937 e os Argumentos do Executivo" id="adi" />
                        <Paragraph>
                            O Governo do Estado de Pernambuco baseia sua resistência na ADI 7937 em dois eixos principais: o vício de iniciativa (constitucionalidade formal) e o impacto fiscal (constitucionalidade material). A tese do vício de iniciativa sustenta que matérias que tratam de remuneração de servidores e regime jurídico são de competência privativa do Chefe do Poder Executivo, nos termos do art. 61, § 1º, inciso II, alíneas 'a' e 'c' da Constituição Federal. Segundo o governo estadual, a Alepe teria usurpado essa competência ao promulgar a emenda sem a provocação do Executivo.
                        </Paragraph>
                        <Paragraph>
                            Entretanto, este argumento enfrenta uma barreira interpretativa sólida. O STF, em diversos precedentes, tem diferenciado a iniciativa legislativa para leis ordinárias da iniciativa para o exercício do poder constituinte derivado reformador. Como a própria Constituição Federal impõe a "emenda à constituição estadual" como o veículo para a fixação do teto único, condicionar esse poder à iniciativa exclusiva do governador anularia a autonomia do Poder Legislativo em sua função constituinte decorrente. A ANTC, em sua intervenção como <em>amicus curiae</em>, reforça que o teto remuneratório não é uma norma concessiva de aumento, mas sim uma norma de contenção, o que afasta a incidência da reserva de iniciativa voltada para a criação de despesas.
                        </Paragraph>

                        <div className="my-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Tabela 2: Projeção de Impacto Financeiro (Estimativas do Executivo)</h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Período</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Impacto Estimado (R$)</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Justificativa do Governo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-4 py-4 font-medium">Mensal (2026)</td>
                                            <td className="px-4 py-4 font-mono text-red-600">R$ 7.900.000,00</td>
                                            <td className="px-4 py-4">Aumento da margem para o "Teto Único".</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-medium">Anual (2026)</td>
                                            <td className="px-4 py-4 font-mono text-red-600 font-bold">R$ 105.200.000,00</td>
                                            <td className="px-4 py-4">Soma das diferenças salariais e encargos.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-3 text-xs text-slate-500 italic text-center">Fonte: Secretaria de Administração de Pernambuco (SAD).⁴</p>
                        </div>

                        <Paragraph>
                            O governo estadual alega que o impacto de mais de <strong>R$ 105 milhões</strong> anuais compromete o equilíbrio das contas públicas e a Lei de Responsabilidade Fiscal. Contudo, associações como o SindiFisco-PE argumentam que esse valor é ínfimo diante da arrecadação estadual e que a valorização das carreiras típicas de Estado, especialmente a Administração Tributária, é o caminho mais curto para o incremento da receita, tornando o investimento em pessoal autossustentável.
                        </Paragraph>
                    </section>

                    {/* Section 4: Paradigma TCE-PE */}
                    <section id="paradigma">
                        <SectionHeader title="4. O Paradigma do TCE-PE e o Cumprimento Constitucional" id="paradigma" />
                        <Paragraph>
                            A aplicação da EC 68/2025 pelo Tribunal de Contas do Estado de Pernambuco (TCE-PE) não figura como o argumento jurídico decisório para o desfecho da ADI 7937, mas sim como uma contundente demonstração de boa-fé e de estrito cumprimento constitucional pelo órgão. Ao reconhecer a eficácia imediata da norma e parametrizar sua folha de pagamento para contemplar o novo teto para os auditores de controle externo, o TCE-PE reafirma a sua submissão ao comando do Poder Constituinte Derivado Estadual.
                        </Paragraph>
                        <Paragraph>
                            A atual disparidade — onde auditores do TCE-PE já se encontram sob a égide do novo teto enquanto demais categorias permanecem atreladas ao limite anterior — evidencia as disfunções de uma resistência administrativa. A nova redação constitucional determina um teto único, tornando o fiel cumprimento da norma a medida esperada para todas as esferas estaduais.
                        </Paragraph>
                        <Paragraph>
                            Desta forma, o TCE-PE exerce seu papel de observância da legalidade. Ao não aguardar um eventual desfecho dilatório da ADI 7937 para aplicar a emenda promulgada pela Alepe, a Corte de Contas corrobora a presunção de validade inerente e a exigibilidade normativa do novo texto.
                        </Paragraph>
                    </section>

                    {/* Section 5: Luta Associativa */}
                    <section id="luta">
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 sm:p-8 my-10 rounded-r-xl">
                            <h2 className="text-2xl font-serif font-bold text-indigo-900 mb-4 tracking-tight" id="luta">5. A Importância da Manutenção da PEC e a Luta Associativa</h2>
                            <p className="text-indigo-800 mb-4">A atuação de entidades de classe, como a contribuição ativa do SindiFisco-PE e da ANTC, reveste-se de grande relevância na defesa das prerrogativas funcionais. Entretanto, o foco principal que une a Associação dos Auditores do Tribunal de Contas e demais representações é a consolidação da vitória alcançada com a Emenda Constitucional 68/2025.</p>
                            <p className="text-indigo-800 mb-4">A manutenção da PEC é um marco imperativo para o fortalecimento das carreiras típicas de Estado. Diante da postura governamental, a articulação técnica e a adoção de posturas firmes provaram ser estratégias não só para resguardar as finanças, mas para proteger a paridade e assegurar o espaço fundamental do serviço público.</p>
                            <p className="text-indigo-800 mb-0">
                                <strong>Destaca-se o papel essencial da Associação Nacional dos Auditores de Controle Externo dos Tribunais de Contas do Brasil (ANTC)</strong>. A sua forte atuação e o ingresso jurídico na Suprema Corte na condição de <em>amicus curiae</em> enriquecem o debate constitucional, suprindo o STF com os necessários subsídios técnicos, ressaltando o não cabimento do vício de iniciativa invocado e demonstrando a dimensão nacional e a correção material do modelo adotado por Pernambuco.
                            </p>
                        </div>
                        <Paragraph>
                            A categoria entende que o "Teto Único" não é apenas uma questão financeira, mas uma ferramenta de proteção da autonomia da fiscalização tributária. Atrelar o teto aos 100% do subsídio dos ministros do STF coloca os auditores pernambucanos em pé de igualdade com carreiras federais e de estados que já adotaram este modelo, como o Pará.
                        </Paragraph>
                    </section>

                    {/* Section 6: Evolução Constitucional */}
                    <section id="evolucao">
                        <SectionHeader title="6. O 'Teto Único' e a Evolução Constitucional" id="evolucao" />
                        <Paragraph>
                            A fixação do teto com base no subsídio dos desembargadores é, na prática, a adoção do teto dos ministros do STF por via reflexa. Esta interpretação decorre da jurisprudência do próprio Supremo, que ao julgar as ADIs 3854 e 4014, reconheceu que a magistratura estadual é parte de um corpo nacional, não podendo estar sujeita a limites inferiores aos da magistratura federal.
                        </Paragraph>
                        <Paragraph>
                            Quando a EC 68/2025 retira a menção aos 90,25%, ela apenas acompanha essa evolução interpretativa. Se o subsídio do desembargador do TJPE não sofre mais o redutor percentual na fonte, o teto que toma esse subsídio como parâmetro também deve refletir o valor integral.
                        </Paragraph>
                        <Paragraph>
                            Estabelecer um "subteto do subteto" para servidores do Executivo, mantendo-os em 90,25% enquanto outras categorias sob o mesmo teto único (como procuradores, membros do MP e magistrados) recebem 100%, criaria uma injustiça jurídica.
                        </Paragraph>

                        <div className="my-10">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Tabela 3: Cenários de Teto Remuneratório no Brasil</h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Paradigma</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Valor de Referência</th>
                                            <th className="px-4 py-3 text-left font-bold text-slate-800">Aplicação em PE (Pós-EC 68/2025)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-4 py-4 font-medium">Teto Nacional</td>
                                            <td className="px-4 py-4">Subsídio Ministro STF</td>
                                            <td className="px-4 py-4 text-green-700 font-medium">Aplicável via equiparação aos Desembargadores.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-medium">Subteto Estadual (Reduzido)</td>
                                            <td className="px-4 py-4 text-slate-400">90,25% do STF</td>
                                            <td className="px-4 py-4 text-slate-400 italic">Modelo superado pela nova emenda estadual.</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-4 font-medium">Subteto Único (Magistratura)</td>
                                            <td className="px-4 py-4">Subsídio Desembargador</td>
                                            <td className="px-4 py-4 text-indigo-700 font-bold">Modelo adotado por PE e Pará (EC 85/2022).</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Section 7: Presunção de Validade */}
                    <section id="presuncao">
                        <SectionHeader title="7. Presunção de Constitucionalidade e Dever de Obediência" id="presuncao" />
                        <Paragraph>
                            Um princípio basilar do Direito Público é que as leis nascem com presunção de validade. No caso de uma Emenda Constitucional Estadual, essa presunção é ainda mais forte, pois emana do poder constituinte derivado. Enquanto o STF não conceder uma medida cautelar suspendendo os efeitos da EC 68/2025 na ADI 7937, a norma está em pleno vigor e deve ser fielmente executada pela Administração Pública.
                        </Paragraph>
                        <Paragraph>
                            A resistência do Governo em autorizar os pagamentos constitui uma inversão da lógica jurídica: o Executivo está agindo como se a simples interposição da ação judicial tivesse efeito suspensivo automático, o que não existe no ordenamento brasileiro. O risco de dano reverso é evidente: ao não pagar agora, o Estado acumula uma dívida corrigida e com juros que será cobrada via precatórios ou ações de cobrança vitoriosas no futuro.
                        </Paragraph>
                    </section>

                    {/* Section 8: Perfil do Relator */}
                    <section id="relator">
                        <SectionHeader title="8. O Perfil do Relator e as Decisões em Casos Análogos" id="relator" />
                        <Paragraph>
                            O ministro André Mendonça, relator da ADI 7937, tem demonstrado rigor na observância do teto constitucional em casos de verbas indenizatórias "disfarçadas", como visto na ADI 7402. Entretanto, há uma distinção fundamental: em Goiás, tentou-se pagar acima do teto através de manobras de nomenclatura; em Pernambuco, discute-se a fixação do valor do teto dentro das balizas permitidas pela Constituição Federal.
                        </Paragraph>
                        <Paragraph>
                            Mendonça ressaltou em suas decisões que "o teto abrange a integralidade das parcelas que compõem a remuneração". Se o parâmetro escolhido pelo estado de Pernambuco é o subsídio do desembargador, e este subsídio é hoje nacionalizado em 100% do STF, o ministro terá de decidir se a autonomia estadual permite acompanhar essa paridade.
                        </Paragraph>
                    </section>

                    {/* Section 9: Conclusão */}
                    <section id="conclusao" className="mb-20">
                        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-xl my-16 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                                <Scale className="w-56 h-56" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-0 mb-6 tracking-tight relative z-10" id="conclusao">9. Considerações Finais sobre o Tema</h2>
                            <div className="space-y-4 text-slate-300 relative z-10 text-lg">
                                <p>A situação em Pernambuco exige uma solução que respeite a competência de iniciativa da Assembleia Legislativa e a dignidade das carreiras de Estado. A Emenda Constitucional 68/2025 é um instrumento legítimo de política remuneratória, amparado pela Constituição Federal e pela necessidade de modernização administrativa.</p>
                                <p>A resistência do Poder Executivo em cumprir a norma enquanto aguarda o STF é um precedente perigoso que fragiliza a segurança jurídica e desrespeita a presunção de constitucionalidade das leis. A atuação do TCE-PE no imediato cumprimento do novo teto serve como testemunho da boa-fé e estrita obediência constitucional.</p>
                                <p>Para a Associação dos Auditores do Tribunal de Contas e o conjunto das entidades, o momento demanda coesão na manutenção e defesa desta PEC. Validar o teto único não se resume a uma alteração de ganhos, mas implica em ratificar o modelo de controle e arrecadação de um Estado que valoriza o mérito, a competência e a justiça em sua Administração Pública.</p>
                            </div>
                        </div>

                        {/* References */}
                        <div className="mt-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                <FileText size={16} /> Referências Citadas
                            </h3>
                            <ul className="text-sm text-slate-600 space-y-4 list-decimal pl-5 marker:font-bold">
                                <li><a href="https://legis.alepe.pe.gov.br/?ec682025" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Emenda Constitucional nº 68, de 18 de dezembro de 2025. Alepe Legis.</a></li>
                                <li><a href="https://sindifiscope.org.br/sindifisco-esclarece-filiados-e-cobra-aplicacao-imediata-do-novo-teto-com-base-em-parecer-do-relator-da-alepe/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Sindifisco esclarece filiados e cobra aplicação imediata do novo teto.</a></li>
                                <li><a href="https://noticias.stf.jus.br/postsnoticias/governadora-de-pernambuco-questiona-no-stf-emenda-sobre-teto-salarial-dos-servidores-estaduais/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Governadora de Pernambuco questiona no STF emenda sobre teto salarial.</a></li>
                                <li><a href="https://www.jota.info/stf/do-supremo/adi-no-stf-contesta-emenda-da-alepe-sobre-teto-do-funcionalismo-publico-em-pernambuco" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">ADI no STF contesta emenda da ALEPE sobre teto do funcionalismo - JOTA.</a></li>
                                <li><a href="https://sindifiscope.org.br/sindifisco-reforca-mobilizacao-pela-paridade-e-mantem-assembleia-permanente-apos-plenaria-com-mais-de-350-filiados/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Sindifisco reforça mobilização pela paridade e mantém Assembleia Permanente.</a></li>
                                <li><a href="https://www.cbnrecife.com/2026/02/19/governo-de-pernambuco-aciona-stf-para-barrar-emenda-que-aumenta-teto-salarial-de-servidores/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Governo de Pernambuco aciona STF para barrar emenda que aumenta teto salarial (CBN).</a></li>
                                <li><a href="https://www12.senado.leg.br/orcamento/documentos/estudos/tipos-de-estudos/notas-tecnicas-e-informativos/nota-informativa-decisoes-stf-versao-final.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Decisões do STF sobre emendas parlamentares (Senado Federal).</a></li>
                                <li><a href="https://www.jota.info/stf/do-supremo/mendonca-suspende-lei-de-goias-que-autorizava-salarios-de-servidores-acima-do-teto" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline decoration-slate-200 underline-offset-4">Mendonça suspende lei de Goiás que autorizava salários acima do teto.</a></li>
                            </ul>
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

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-xs text-gray-400 uppercase mb-3">Recursos Oficiais</h4>
                            <ul className="space-y-2">
                                <li><a href="https://legis.alepe.pe.gov.br/?ec682025" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-900 p-2 bg-gray-50 rounded hover:bg-sky-50 transition"><span>EC 68/2025 (Alepe)</span> <ChevronRight className="w-4 h-4" /></a></li>
                                <li><a href="https://portal.stf.jus.br/processos/detalhe.asp?incidente=7502817" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-900 p-2 bg-gray-50 rounded hover:bg-sky-50 transition"><span>Acompanhamento ADI 7937</span> <ChevronRight className="w-4 h-4" /></a></li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default ArticleTetoRemuneratorio;
