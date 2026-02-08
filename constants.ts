import { NewsCategory, NewsItem, ServiceLink } from './types';

export const BOARD_MEMBERS = [
  { name: 'Carlos Andrade', role: 'Presidente', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Fernanda Lima', role: 'Vice-Presidente', image: 'https://images.unsplash.com/photo-1573496359-e36b6c013310?auto=format&fit=crop&q=80&w=400' },
  { name: 'Roberto Mendes', role: 'Diretor Financeiro', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Juliana Costa', role: 'Diretora Jurídica', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
  { name: 'Ricardo Silva', role: 'Diretor de Comunicação', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400' },
];

export const PARTNERS = [
  { name: 'Faculdade Alpha', discount: '20% de desconto', category: 'Educação', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=200' },
  { name: 'Academia FitLife', discount: 'Mensalidade corporativa', category: 'Saúde', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' },
  { name: 'Clínica Sorriso', discount: '15% em procedimentos', category: 'Saúde', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=200' },
  { name: 'Livraria Leitura', discount: '10% em todo o site', category: 'Cultura', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=200' },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'posse-tce-pe-2026',
    title: 'ANTC participa da posse da nova direção do TCE-PE e reforça agenda institucional em Recife',
    summary: 'Associação Nacional marcou presença na cerimônia de posse do conselheiro Carlos Neves como novo presidente do Tribunal de Contas de Pernambuco para o biênio 2026-2027.',
    content: `
      <p class="mb-4">A Associação Nacional dos Auditores de Controle Externo dos Tribunais de Contas do Brasil (ANTC) participou da solenidade de posse da nova mesa diretora do Tribunal de Contas do Estado de Pernambuco (TCE-PE), realizada no dia 20 de janeiro de 2026. O evento marcou o início da gestão do conselheiro Carlos Neves na presidência da Corte de Contas para o biênio 2026-2027.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <img src="/news/posse/img1.jpg" alt="Posse TCE-PE" class="w-full h-auto rounded-lg shadow-md" />
        <img src="/news/posse/img2.jpg" alt="Autoridades na Posse" class="w-full h-auto rounded-lg shadow-md" />
      </div>

      <p class="mb-4">A representação da ANTC no evento reforçou o compromisso da entidade com o fortalecimento das instituições de controle externo em todo o país. A presença da associação nacional em agendas estaduais é fundamental para alinhar estratégias e defender as prerrogativas dos auditores de controle externo.</p>

      <div class="my-8">
         <img src="/news/posse/img3.jpg" alt="Auditores na Posse" class="w-full h-auto rounded-lg shadow-md mb-2" />
         <p class="text-sm text-gray-500 text-center italic">Representantes da classe e autoridades durante a cerimônia.</p>
      </div>

      <p class="mb-4">Durante a passagem por Recife, a liderança da ANTC também cumpriu agenda institucional, dialogando com representantes locais sobre temas de interesse da categoria e do sistema de controle externo.</p>
    `,
    date: '2026-01-20',
    imageUrl: '/news/posse 2026/WhatsApp_Image_2026-01-20_at_11.49.30.jpeg',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: false,
    author: 'Comunicação ANTC'
  },
  {
    id: 'loaud-mg',
    title: 'ANTC apresenta LOAUD ao Conselheiro Presidente do TCE-MG',
    summary: 'ANTC apresenta minuta da Lei Orgânica Nacional da Auditoria de Controle Externo ao Conselheiro Presidente do TCE-MG, Durval Ângelo.',
    content: `
      <p class="mb-4">A Associação Nacional dos Auditores de Controle Externo dos Tribunais de Contas do Brasil (ANTC) apresentou a minuta da Lei Orgânica Nacional da Auditoria de Controle Externo (LOAUD) ao Conselheiro Presidente do Tribunal de Contas do Estado de Minas Gerais (TCE-MG), Durval Ângelo, e ao Vice-Presidente, Agostinho Patrus.</p>
      
      <div class="my-8">
        <img src="/news/loaud/img2.jpeg" alt="Reunião no TCE-MG" class="w-full h-auto rounded-lg shadow-md mb-2" />
        <p class="text-sm text-gray-500 text-center italic">Reunião entre representantes da ANTC, AudTCE-MG e a Presidência do TCE-MG.</p>
      </div>

      <p class="mb-4">O encontro contou com a presença da Presidente da ANTC, Thaisse Craveiro, e do Presidente da AudTCE-MG, Anderson Sampaio. O Presidente da ATRICON, Conselheiro Edilson Silva, também participou de parte da reunião, reforçando a importância de uma legislação que permita aos Tribunais de Contas operarem em simetria com o padrão do TCU.</p>

      <p class="mb-4">Durante a reunião, foram apresentados os pilares centrais da LOAUD: estabelecimento de um padrão mínimo para a atividade de auditoria de controle externo, promoção da transparência e eficácia nas fiscalizações, e o reconhecimento da Auditoria de Controle Externo como função essencial à democracia.</p>
      
      <p>Além disso, houve uma reunião com o Diretor-Geral do TCE-MG, o Auditor de Controle Externo Gustavo Vidigal, para aprofundar os fundamentos do projeto e garantir coerência institucional ao sistema de controle.</p>
    `,
    date: '2026-02-03',
    imageUrl: '/news/loaud/img1.jpeg',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Comunicação ANTC'
  },
];

export const SERVICES: ServiceLink[] = [
  {
    title: 'Área do Filiado',
    image: '/access/member_area.png',
    description: 'Atualize seus dados e acesse documentos exclusivos.',
    link: '/area-do-filiado'
  },
  {
    title: 'Jurídico',
    image: '/access/legal.png',
    description: 'Consulte processos e agende atendimento.',
    link: '/juridico'
  },
  {
    title: 'Convênios',
    image: '/access/partners.png',
    description: 'Descontos em escolas, academias e serviços.',
    link: '/convenios'
  },
  {
    title: 'Prestação de Contas',
    image: '/access/accountability.png',
    description: 'Transparência total na gestão da associação. (Acesso Restrito)',
    link: '/area-do-filiado/financeiro'
  }
];

export const MOCK_AUDITS = [
  {
    id: 'tce-pe-economia-paulista-2024',
    title: 'Auditoria do TCE-PE gera economia de 30 milhões em licitação de Paulista',
    summary: 'Análise de edital feita pela GLIC levou a Prefeitura a economizar na compra de merenda escolar, reduzindo valor de R$39,2 mi para R$8,5 mi.',
    date: '2024-11-01',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    status: 'Concluída',
    content: `
      <p class="mb-4">Uma auditoria feita pelo Tribunal de Contas de Pernambuco (TCE-PE) levou a Prefeitura do Paulista a economizar mais de R$30 milhões na compra de merenda escolar para a rede municipal de ensino.</p>
      
      <p class="mb-4">O trabalho foi feito pela Gerência de Procedimentos Licitatórios (GLIC) do TCE-PE, que encontrou falhas no edital, como preços superestimados e quantidade de itens além do necessário.</p>
      
      <p class="mb-4">Ao ser informada das irregularidades, a prefeitura revogou o edital e iniciou uma série de reuniões com a equipe da GLIC para corrigir as inconsistências. A cooperação resultou na republicação do edital, com redução do valor do contrato de R$39,2 milhões para R$8,5 milhões. O município do Paulista está sob relatoria do conselheiro Marcos Loreto.</p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">SGI: Sistema de Gerenciamento de Indícios</h3>
      
      <p class="mb-4">A atuação em Paulista faz parte de um projeto-piloto do Tribunal de Contas para implementar o Sistema de Gerenciamento de Indícios (SGI) em licitações.</p>
      
      <div class="my-6 p-4 bg-gray-50 border-l-4 border-secondary-500 italic">
        "Temos trabalhado para intensificar nossa atuação preventiva e pedagógica, com o objetivo de impedir a concretização dos riscos que podem levar a danos futuros ao erário, além de capacitar os gestores para evitar que as irregularidades voltem a ocorrer em licitações futuras"
        <footer class="text-sm font-bold text-gray-600 mt-2">— Rafael Lira, chefe do Departamento de Controle Externo</footer>
      </div>
      
      <p class="mb-4">O SGI é uma ferramenta desenvolvida pelo TCE-PE para facilitar a comunicação com as unidades fiscalizadas e intensificar a atuação preventiva do controle externo. Em 2023 foi lançada a versão do sistema para fiscalizar folhas de pagamento.</p> 
      
      <p>Este ano, com previsão de lançamento até o fim do ano, o sistema vai ajudar a identificar indícios de irregularidades em editais de licitação, permitindo que os gestores façam os ajustes necessários antes que as falhas se concretizem, e sem a necessidade de abrir processos formais. A implantação será gradual, até alcançar todo o estado.</p>
      
      <p class="mt-8 text-sm text-gray-500">Fonte: Gerência de Jornalismo (GEJO), 01/11/2024</p>
    `
  }
];

export const MOCK_ARTICLES = [
  {
    id: 'inversao-hierarquica',
    title: 'A Inversão Hierárquica no Controle Externo',
    author: 'Lucas Nobre - ACE Obras',
    date: '2023-10-15',
    summary: 'Análise sobre a constitucionalidade da transposição de cargos e funções de chefia.',
    link: '/analise-tecnica/inversao-hierarquica',
    image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=800'
  }
];