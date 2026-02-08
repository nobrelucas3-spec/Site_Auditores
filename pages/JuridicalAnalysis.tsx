import React, { useState, useEffect } from 'react';
import { BookOpen, Share2, Printer, ChevronRight, User, Calendar, Clock, Menu, X, List } from 'lucide-react';
import { SectionHeader, SubSectionHeader, Paragraph, PullQuote, InfoBox, AlertBox, CaseStudyCard, ComparisonTable } from '../components/ArticleComponents';
import { HierarchyChart, SalaryBandChart } from '../components/Charts';

interface Section {
    id: string;
    title: string;
}

const JuridicalAnalysis: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('intro');
    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

    const sections: Section[] = [
        { id: 'intro', title: 'Introdução' },
        { id: 'reestruturacao', title: 'A Reestruturação de 2017' },
        { id: 'distincao', title: 'Distinção Ontológica' },
        { id: 'papel-gerente', title: 'O Papel do Gerente' },
        { id: 'barreira', title: 'A Barreira Constitucional' },
        { id: 'jurisprudencia', title: 'Jurisprudência do STF' },
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
                title: 'A Inversão Hierárquica no Controle Externo',
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
                            Nota Técnica Jurídica
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight mb-6">
                            A Inversão Hierárquica no Controle Externo: Uma Análise do Caso TCE-PE
                        </h1>
                        <p className="text-xl text-gray-600 font-serif leading-relaxed mb-8 border-l-4 border-secondary-500 pl-4">
                            Relatório técnico disseca como conflitos de competência e a transposição de cargos ameaçam a segurança jurídica das auditorias em Pernambuco à luz da Constituição e da jurisprudência do Supremo.
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-primary-800" />
                                <span className="font-medium text-primary-800">Lucas Nobre - ACE Obras</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>15 de Outubro, 2023</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>12 min de leitura</span>
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full transition text-primary-800"><Share2 className="w-4 h-4" /></button>
                                <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-full transition text-primary-800"><Printer className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </header>

                    {/* Section 1: Intro */}
                    <section>
                        <SectionHeader title="1. Introdução" id="intro" />
                        <Paragraph className="drop-cap first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-black first-letter:text-primary-900">
                            A arquitetura institucional dos Tribunais de Contas no Brasil, enquanto órgãos de extração constitucional encarregados do controle externo da Administração Pública, repousa sobre pilares fundamentais de legalidade, impessoalidade e, sobretudo, competência técnica.
                        </Paragraph>
                        <Paragraph>
                            No âmbito do Tribunal de Contas do Estado de Pernambuco (TCE-PE), a edição da <strong>Lei Estadual nº 16.039/2017</strong> inaugurou um novo capítulo na organização de seu quadro funcional. No entanto, este capítulo trouxe consigo um dilema jurídico complexo: a viabilidade de servidores ocupantes do cargo de <em>Analista de Controle Externo</em> exercerem a função gratificada de Gerente (símbolo TC-FGG), atuando como autoridade revisora de servidores ocupantes do cargo de <em>Auditor de Controle Externo</em>.
                        </Paragraph>
                        <PullQuote text="A instrução processual é a fase crítica onde se materializa a 'fé pública' do controle externo." />
                    </section>

                    {/* Section 2: Reestruturação */}
                    <section>
                        <SectionHeader title="2. A Reestruturação Normativa de 2017" id="reestruturacao" />
                        <Paragraph>
                            A Lei nº 16.039/2017 operou como um instrumento de metamorfose funcional. Para compreender a tensão atual, é preciso analisar como ela redefiniu o DNA das carreiras.
                        </Paragraph>

                        <SubSectionHeader title="A Consolidação do Auditor" />
                        <Paragraph>
                            O parágrafo 1º do artigo 1º fundiu diversas carreiras finalísticas (Auditor das Contas Públicas, Inspetor de Obras, etc.) sob a nomenclatura unificada de <strong>Auditor de Controle Externo</strong>. Esta unificação fortaleceu a identidade da carreira de Estado responsável pela titularidade do controle externo, alinhando-se ao modelo federal do TCU.
                        </Paragraph>

                        <SubSectionHeader title="A Ascensão Nominal do Analista" />
                        <Paragraph>
                            O ponto de inflexão reside na transformação dos cargos de Técnico de Auditoria e Programador em <strong>Analista de Controle Externo</strong>. Embora a nomenclatura tenha sido elevada, a origem funcional desses cargos remete a atividades de apoio. A lei os inseriu no mesmo Grupo Ocupacional (GOCE), criando uma permissão formal aparente para a fungibilidade de funções de chefia.
                        </Paragraph>

                        <InfoBox title="O Detalhe da Lei">
                            <p>
                                O Art. 1º, § 2º da Lei 16.039/2017 transformou antigos cargos de nível médio/técnico em Analistas.
                                Apesar de estarem no mesmo grupo (GOCE), as faixas salariais revelam a hierarquia implícita:
                                Auditores iniciam na <strong>Faixa 3</strong>, enquanto Analistas iniciam na <strong>Faixa 1</strong>.
                            </p>
                        </InfoBox>

                        <SalaryBandChart />
                    </section>

                    {/* Section 3: Distinção */}
                    <section>
                        <SectionHeader title="3. Distinção Ontológica" id="distincao" />
                        <Paragraph>
                            A despeito da coabitação no mesmo grupo ocupacional, Auditores e Analistas possuem DNAs funcionais distintos. A análise comparativa demonstra que não se trata de carreiras intercambiáveis, mas sim de carreiras que deveriam operar em regime de "paralelismo" (suporte vs. fim).
                        </Paragraph>

                        <Paragraph>
                            O <strong>Auditor</strong> detém a competência para coordenar, supervisionar e realizar auditorias plenas. O <strong>Analista</strong>, especialmente aquele oriundo de transformação, possui uma natureza de suporte. A atribuição de competências de chefia a este grupo configura uma transposição de fato.
                        </Paragraph>

                        <ComparisonTable />

                        <Paragraph>
                            A tabela acima evidencia a incompatibilidade. Um Analista revisando o trabalho técnico de um Auditor inverte a lógica do conhecimento: o profissional com requisitos de ingresso mais genéricos ou de menor complexidade revisa o trabalho daquele investido em cargo de maior complexidade.
                        </Paragraph>
                    </section>

                    {/* Section 4: Papel do Gerente */}
                    <section>
                        <SectionHeader title="4. O Papel do Gerente na Instrução" id="papel-gerente" />
                        <Paragraph>
                            A função de Gerente (TC-FGG) não é meramente administrativa. É o elo de controle de qualidade. O Gerente planeja o escopo, supervisiona a execução em campo e, crucialmente, <strong>revisa o mérito</strong> do Relatório de Auditoria.
                        </Paragraph>
                        <Paragraph>
                            No Direito Administrativo, não se admite que um ato complexo seja validado por autoridade incompetente <em>ratione materiae</em>. Se o Analista não tem a investidura de Auditor (carreira plena), ele carece de competência material para validar achados de auditoria complexos, como irregularidades em obras de engenharia ou contabilidade pública avançada.
                        </Paragraph>
                    </section>

                    {/* Section 5: Barreira Constitucional */}
                    <section>
                        <SectionHeader title="5. A Barreira Constitucional" id="barreira" />
                        <Paragraph>
                            A estrutura atual colide frontalmente com a Súmula Vinculante nº 43 do Supremo Tribunal Federal, que veda o provimento derivado sem concurso público.
                        </Paragraph>

                        <AlertBox title="Súmula Vinculante 43 (STF)">
                            "É inconstitucional toda modalidade de provimento que propicie ao servidor investir-se, sem prévia aprovação em concurso público destinado ao seu provimento, em cargo que não integra a carreira na qual anteriormente investido."
                        </AlertBox>

                        <Paragraph>
                            Ao permitir que Analistas (ex-Técnicos) exerçam chefia sobre a atividade-fim, a Lei Estadual cria um "trem da alegria" funcional, conferindo competências de coordenação e revisão para as quais esses servidores não foram originalmente concursados. Isso gera uma ineficiência administrativa e inverte a pirâmide hierárquica.
                        </Paragraph>

                        <HierarchyChart />
                    </section>

                    {/* Section 6: Jurisprudência */}
                    <section>
                        <SectionHeader title="6. Jurisprudência do STF" id="jurisprudencia" />
                        <Paragraph>
                            O STF tem sido implacável na proteção das carreiras típicas de Estado. Dois precedentes desenham o "caminho das pedras" para a inconstitucionalidade da situação pernambucana.
                        </Paragraph>

                        <CaseStudyCard
                            title="ADI 6655 (Caso Sergipe)"
                            subtitle="Relator: Min. Edson Fachin (2022)"
                            content="O Tribunal julgou inconstitucional lei que permitia cargos de coordenação no TCE-SE fossem ocupados por estranhos à carreira de Auditor. Entendeu-se que a coordenação técnica é atividade finalística exclusiva."
                            outcome="A coordenação é privativa do Auditor."
                        />

                        <CaseStudyCard
                            title="ADI 5391 (Receita Federal)"
                            subtitle="Relatora: Min. Rosa Weber"
                            content="Consagrou a tese de que carreiras de Auditor e Analista, mesmo no mesmo órgão, são 'paralelas e impenetráveis'. O Analista (suporte) não pode exercer funções privativas ou decisórias do Auditor."
                            outcome="Carreiras paralelas não se confundem hierarquicamente."
                        />
                    </section>

                    {/* Section 7: Conclusão */}
                    <section className="mb-20">
                        <SectionHeader title="7. Conclusão e Recomendações" id="conclusao" />
                        <Paragraph>
                            A análise revela um quadro de insegurança jurídica. A manutenção de Analistas na chefia de Auditores (TC-FGG) viola a lógica do concurso público, a eficiência administrativa e as normas internacionais de auditoria (NBASP 40).
                        </Paragraph>
                        <Paragraph>
                            Recomenda-se, em caráter de urgência, a <strong>Interpretação Conforme a Constituição</strong> da lei estadual, restringindo o acesso às funções de gerência de fiscalização exclusivamente aos Auditores de Controle Externo. Somente assim o TCE-PE garantirá que a "fé pública" de seus relatórios permaneça inabalável.
                        </Paragraph>
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
                            <h4 className="font-bold text-xs text-gray-400 uppercase mb-3">Recursos Relacionados</h4>
                            <ul className="space-y-2">
                                <li><a href="https://legis.alepe.pe.gov.br/texto.aspx?tiponorma=1&numero=16039&complemento=0&ano=2017&tipo=" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-900 p-2 bg-gray-50 rounded hover:bg-sky-50 transition"><span>Lei nº 16.039/2017 (TCE-PE)</span> <ChevronRight className="w-4 h-4" /></a></li>
                                <li><a href="https://jurisprudencia.stf.jus.br/pages/search/sjur467160/false" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-900 p-2 bg-gray-50 rounded hover:bg-sky-50 transition"><span>Súmula Vinculante 43</span> <ChevronRight className="w-4 h-4" /></a></li>
                                <li><a href="https://portal.stf.jus.br/processos/detalhe.asp?incidente=6084041" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-900 p-2 bg-gray-50 rounded hover:bg-sky-50 transition"><span>Consulta ADI 6655</span> <ChevronRight className="w-4 h-4" /></a></li>
                            </ul>
                        </div>
                    </div>
                </aside>

            </main>
        </div>
    );
};

export default JuridicalAnalysis;
