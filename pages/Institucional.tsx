import React from 'react';
import { supabase } from '../services/supabaseClient';
import { BOARD_MEMBERS } from '../constants';
import { FileText, Award, Users } from 'lucide-react';

interface InstitucionalProps {
  type: 'quem-somos' | 'estatuto' | 'diretoria';
}

const Institucional: React.FC<InstitucionalProps> = ({ type }) => {
  const renderContent = () => {
    switch (type) {
      case 'quem-somos':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-secondary-500" size={32} />
              <h1 className="text-3xl font-bold text-primary-900">Quem Somos</h1>
            </div>
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
              alt="Sede da Associação"
              className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg mb-8"
            />
            <div className="prose prose-lg text-gray-700 max-w-none">
              <p className="lead font-medium text-lg">
                A Associação dos Auditores de Controle Externo do Tribunal de Contas do Estado de Pernambuco (Auditores TCE-PE) é uma entidade civil sem fins lucrativos, fundada com o propósito de congregar e representar os profissionais da área.
              </p>
              <p>
                Nossa missão é defender as prerrogativas da carreira, promover a qualificação técnica contínua e atuar em defesa do controle externo independente, técnico e efetivo, contribuindo para a boa gestão dos recursos públicos em benefício da sociedade pernambucana.
              </p>
              <h3 className="text-xl font-bold mt-6 mb-3 text-primary-800">Nossos Valores</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ética e Transparência</li>
                <li>Independência Técnica</li>
                <li>Compromisso Público</li>
                <li>Solidariedade e União da Categoria</li>
              </ul>
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
                .or('category.ilike.%estatuto%,title.ilike.%estatuto%,title.ilike.%sindicato%')
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
              Conheça os membros eleitos para a gestão 2024-2026, responsáveis pela administração e representação da nossa associação.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BOARD_MEMBERS.map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 group">
                  <div className="h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
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