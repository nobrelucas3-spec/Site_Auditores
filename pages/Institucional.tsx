import React from 'react';
import { supabase } from '../services/supabaseClient';
import { BOARD_MEMBERS, FISCAL_COUNCIL_ASSOCIATION, FISCAL_COUNCIL_SYNDICATE } from '../constants';
import { FileText, Award, Users, Target, Eye, Heart, Shield, CheckCircle } from 'lucide-react';

interface InstitucionalProps {
  type: 'quem-somos' | 'estatuto' | 'diretoria';
}

const Institucional: React.FC<InstitucionalProps> = ({ type }) => {
  const renderContent = () => {
    switch (type) {
      case 'quem-somos':
        return (
          <div className="animate-fade-in pb-12">
            
            {/* Header Area */}
            <div className="relative min-h-[220px] md:h-80 rounded-2xl overflow-hidden mb-12 shadow-lg py-8 md:py-0 flex items-center">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                alt="Sede da Associação"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-900/50"></div>
              <div className="relative px-6 md:px-12 z-10 w-full">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <Award className="text-secondary-400" size={36} />
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Quem Somos</h1>
                  </div>
                  <p className="text-sky-100 text-lg md:text-xl max-w-2xl font-light">
                    A voz institucional e independente dos Auditores de Controle Externo do Tribunal de Contas de Pernambuco.
                  </p>
                </div>
            </div>

            {/* Main Text Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16 px-4 md:px-2">
              <div className="lg:col-span-8 space-y-6 text-gray-700 text-base md:text-lg leading-relaxed font-serif">
                <p className="first-letter:text-5xl md:first-letter:text-6xl first-letter:font-black first-letter:text-primary-900 first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                  Somos a Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco (Auditores TCE-PE), uma entidade civil de direito privado, sem fins lucrativos, independente e autônoma, que representa os profissionais responsáveis pelo exercício do controle externo da administração pública no Estado de Pernambuco.
                </p>
                <p>
                  Constituída em 2007, a partir da iniciativa de auditores comprometidos com o fortalecimento da carreira e das instituições de controle, nascemos com o propósito de consolidar uma representação legítima, técnica e articulada da categoria. Desde então, atuamos de forma consistente na defesa das atribuições dos Auditores das Contas Públicas, Auditores da Área de Saúde e Inspetores de Obras Públicas, contribuindo para a valorização profissional e o aprimoramento contínuo das atividades de fiscalização.
                </p>
                
                <div className="p-6 bg-sky-50 border-l-4 border-secondary-500 my-8 rounded-r-lg">
                  <p className="italic text-primary-900 font-semibold mb-0">
                    "Ao longo de nossa trajetória, nos consolidamos como uma entidade atuante no fortalecimento do Tribunal de Contas do Estado de Pernambuco, reconhecendo sua função essencial na preservação do interesse público, na promoção da transparência e no aperfeiçoamento da gestão dos recursos públicos."
                  </p>
                </div>

                <p>
                  Nesse contexto, atuamos de forma propositiva e responsável, contribuindo para o desenvolvimento de um controle externo cada vez mais técnico, independente e efetivo.
                </p>
                <p>
                  Nossa atuação institucional se desenvolve por meio do diálogo permanente com os poderes constituídos, órgãos de controle, entidades representativas e a sociedade civil, sempre orientada pela busca de soluções que aprimorem os mecanismos de fiscalização, fortaleçam a governança pública e ampliem a confiança da sociedade nas instituições.
                </p>
                <p>
                  Além da defesa das prerrogativas da carreira, promovemos iniciativas voltadas à qualificação técnica de nossos associados, à produção e disseminação de conhecimento especializado e ao estímulo de boas práticas na administração pública. Dessa forma, reafirmamos o papel estratégico do controle externo como instrumento indispensável à prevenção de irregularidades, à promoção da eficiência administrativa e ao combate à má gestão dos recursos públicos.
                </p>
              </div>

              {/* Sidebar Highlights */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Autonomia</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Atuamos de forma autônoma na defesa das prerrogativas técnicas da fiscalização e do controle externo do Estado.</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Marco Histórico</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Constituída em 2007, unificando a categoria técnica pilar na prevenção de irregularidades administrativas na máquina pública.</p>
                </div>
              </div>
            </div>

            {/* MVP Section (Mission, Vision, Values) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Box Missão */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-6 shrink-0">
                  <Target size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Missão</h3>
                <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                  Representar e fortalecer a carreira de Auditor de Controle Externo, defendendo suas prerrogativas e promovendo o aprimoramento técnico contínuo, com o objetivo de contribuir para um controle externo independente, eficiente e comprometido com a boa gestão dos recursos públicos.
                </p>
              </div>

              {/* Box Visão */}
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center mb-6 shrink-0">
                  <Eye size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Visão</h3>
                <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                  Ser reconhecida como entidade de referência na defesa institucional do controle externo, destacando-se pela solidez técnica, pela credibilidade e pela contribuição efetiva ao aprimoramento da administração pública.
                </p>
              </div>

              {/* Box Valores */}
              <div className="bg-primary-900 rounded-2xl p-8 shadow-xl hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-sky-800/50 text-secondary-400 flex items-center justify-center mb-6 shrink-0 border border-sky-400/20">
                  <Heart size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Valores</h3>
                <p className="text-sky-100/90 leading-relaxed text-sm flex-grow">
                  Nossa atuação é orientada por princípios institucionais sólidos, que se traduzem na integridade como base de todas as nossas ações, na busca permanente pela excelência técnica, na garantia de independência e imparcialidade no exercício do controle externo, no compromisso com a responsabilidade pública e com o interesse coletivo, no fortalecimento das instituições democráticas e na promoção da coesão e da representatividade da categoria.
                </p>
              </div>
            </div>
          </div>
        );

      case 'estatuto':
        const [documents, setDocuments] = React.useState<any[]>([]);
        const [loadingDocs, setLoadingDocs] = React.useState(true);

        React.useEffect(() => {
          const fetchDocs = async () => {
            try {
              const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('category', 'Estatuto')
                .order('created_at', { ascending: false });

              if (error) {
                console.error('Error fetching documents:', error);
              }

              if (data) setDocuments(data);
            } catch (err) {
              console.error('Unexpected error:', err);
            } finally {
              setLoadingDocs(false);
            }
          };
          fetchDocs();
        }, []);

        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-secondary-500" size={32} />
              <h1 className="text-3xl font-bold text-primary-900">Estatutos e Regulamentos</h1>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <p className="mb-6 text-gray-600">
                Acesse abaixo os documentos que regem o funcionamento da nossa entidade (Associação e Sindicato), definindo os direitos e deveres dos associados/filiados.
              </p>

              {loadingDocs ? (
                <p>Carregando documentos...</p>
              ) : documents.length > 0 ? (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex justify-between items-center hover:bg-white hover:shadow-md transition-all">
                      <div>
                        <h3 className="font-bold text-lg text-primary-800">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.description || 'Documento oficial'}</p>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                      >
                        <FileText size={18} /> Baixar PDF
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-yellow-800">
                  <h3 className="font-bold mb-2">Nenhum documento encontrado</h3>
                  <p>Os arquivos dos estatutos ainda não foram cadastrados na tabela de documentos. Por favor, verifique se você inseriu os registros no Banco de Dados.</p>
                </div>
              )}

              <div className="mt-8 space-y-4">
                {/* Resumo removido */}
              </div>
            </div>
          </div>
        );

      case 'diretoria':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-secondary-500" size={32} />
              <h1 className="text-3xl font-bold text-primary-900">Diretoria Executiva</h1>
            </div>
            <p className="text-gray-600 mb-8 max-w-2xl">
              Conheça os membros eleitos para a gestão 2026-2027, responsáveis pela administração e representação da nossa associação.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BOARD_MEMBERS.map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 group">
                  <div className="h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-contain p-8 bg-gray-50"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-primary-900 mb-1">{member.name}</h3>
                    <p className="text-secondary-600 font-medium uppercase text-sm tracking-wide">{member.role}</p>
                    <div className="w-10 h-1 bg-secondary-400 mx-auto mt-4 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary-900 mb-8 border-b border-gray-200 pb-4">Conselhos Fiscais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-bold text-secondary-600 mb-6 flex items-center gap-2">
                    <Award size={24} />
                    Da Associação (Auditores TCE/PE)
                  </h3>
                  <ul className="space-y-4">
                    {FISCAL_COUNCIL_ASSOCIATION.map((name, idx) => (
                      <li key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
                        <span className="font-medium text-gray-800">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-primary-700 mb-6 flex items-center gap-2">
                    <Users size={24} />
                    Do Sindicato (Auditores Sindical)
                  </h3>
                  <ul className="space-y-4">
                    {FISCAL_COUNCIL_SYNDICATE.map((name, idx) => (
                      <li key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                        <span className="font-medium text-gray-800">{name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default Institucional;