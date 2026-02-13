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
    isHighlight: false,
    author: 'Comunicação ANTC'
  },
  {
    id: 'novo-site-lancamento',
    title: 'Auditores do TCE-PE lançam novo portal com foco em transparência e serviços',
    summary: 'Nova plataforma digital oferece área exclusiva para filiados, prestação de contas em tempo real e acesso facilitado a notícias e atos normativos.',
    content: `
      <p class="mb-4">A Associação dos Auditores do TCE-PE dá um passo importante na modernização de sua comunicação com o lançamento do seu novo portal institucional. A plataforma foi desenvolvida para aproximar ainda mais os associados da entidade e garantir total transparência nas ações da gestão.</p>

      <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">Principais Novidades</h3>

      <ul class="list-disc list-inside space-y-2 mb-6 text-gray-700">
        <li><strong>Área do Filiado:</strong> Espaço exclusivo com login seguro para atualização cadastral e acesso a documentos restritos.</li>
        <li><strong>Portal da Transparência:</strong> Prestação de contas detalhada, com gráficos interativos de receitas e despesas em tempo real.</li>
        <li><strong>Acervo Digital:</strong> Repositório organizado de fotos, vídeos e publicações técnicas.</li>
        <li><strong>Design Responsivo:</strong> Navegação otimizada para celulares e tablets.</li>
      </ul>

      <p class="mb-4">"O novo site reflete o compromisso da nossa diretoria com a inovação e a transparência. Queremos que cada auditor se sinta parte ativa da associação, tendo acesso fácil a todas as informações relevantes", destaca a presidência.</p>

      <div class="my-8 p-4 bg-blue-50 border-l-4 border-primary-500">
        <p class="italic text-primary-800">"A tecnologia é uma aliada fundamental para o fortalecimento institucional e para a prestação de contas à sociedade."</p>
      </div>

      <p>Navegue pelo menu e conheça todas as funcionalidades. A Área do Filiado já está ativa e pode ser acessada com seu email cadastrado.</p>
    `,
    date: '2026-02-12',
    imageUrl: '/news/new_website_launch.png',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Assessoria de Comunicação'
  },
  {
    id: 'nota-ec-68-2025',
    title: 'NOTA AOS ASSOCIADOS: FUNDAMENTAÇÃO JURÍDICA E DEFESA DA EC Nº 68/2025',
    summary: 'Associação manifesta entendimento técnico sobre a validade da Emenda Constitucional nº 68/2025 e convoca para assembleia.',
    content: `
      <p class="mb-4"><strong>NOTA AOS ASSOCIADOS: FUNDAMENTAÇÃO JURÍDICA E DEFESA DA EC Nº 68/2025</strong></p>

      <p class="mb-4">A Associação dos Auditores do TCE-PE vem a público manifestar seu entendimento técnico sobre a validade da Emenda Constitucional nº 68/2025, especificamente no que concerne à instituição do teto remuneratório único estadual. O anúncio de que o Poder Executivo pretende questionar a norma por meio de uma Ação Direta de Inconstitucionalidade (ADI) exige uma resposta jurídica rigorosa, pautada na defesa da soberania do Poder Legislativo e na higidez do texto promulgado.</p>
      
      <p class="mb-4">Não se sustenta a tese de vício de iniciativa sob o argumento de que a matéria seria de competência exclusiva da Governadoria. No ordenamento jurídico brasileiro, é imperativo distinguir o processo legislativo ordinário da atuação da Assembleia Legislativa como Poder Constituinte Derivado Decorrente. No rito de reforma da Constituição Estadual, a iniciativa é concorrente e a própria Constituição Federal, em seu artigo 37, § 12, delega aos Estados a faculdade de instituir o teto único mediante emenda, sem impor restrições quanto à autoria da proposta. Ao promulgar a EC 68/2025, a Assembleia Legislativa exerceu sua competência originária de organizar a estrutura administrativa e remuneratória do Estado.</p>
      
      <p class="mb-4">Sob o aspecto material, o texto aprovado é fiel aos parâmetros do pacto federativo ao estabelecer que o limite da remuneração no Estado de Pernambuco passa a ser o "teto remuneratório mensal dos desembargadores do Tribunal de Justiça". Essa escolha técnica é segura e amplamente chancelada pelo Supremo Tribunal Federal, uma vez que utiliza um referencial remuneratório que já possui balizamento constitucional próprio. Diferente de outras unidades da federação que tentaram fixar limites de forma direta e sem as devidas gradações, a norma pernambucana optou por um parâmetro jurídico consolidado, o que afasta qualquer alegação de incompatibilidade com a Constituição da República.</p>
      
      <p class="mb-4">A preservação da emenda é fundamental para garantir a segurança jurídica e a valorização das carreiras de auditoria. A Associação atuará com firmeza para assegurar que a eficácia da norma seja respeitada, impedindo que interpretações restritivas comprometam conquistas obtidas no campo legislativo. Conclamamos todos os associados para a reunião plenária da Assembleia Permanente, no dia 24 de fevereiro, às 9h30, na sede do Sindifisco, onde definiremos as estratégias de mobilização e as medidas necessárias para a defesa de nossos direitos.</p>
      
      <p class="mt-8 font-bold text-gray-800">Diretoria da Associação dos Auditores do TCE-PE</p>
    `,
    date: '2026-02-13',
    imageUrl: '/news/nota_tecnica_ec68_2025.jpg',
    category: NewsCategory.JURIDICO, // Using JURIDICO category as defined in enum
    isHighlight: true,
    author: 'Diretoria da Associação'
  },
  {
    id: 'stf-tcu-consenso',
    title: 'STF ouve argumentos sobre alcance do controle externo em procedimentos consensuais',
    summary: 'Supremo Tribunal Federal realiza oitivas na ADPF 1183 para debater a constitucionalidade da resolução de conflitos pelo TCU.',
    content: `
      <p class="mb-4">O Supremo Tribunal Federal (STF) realizou sessões para ouvir especialistas e partes interessadas sobre o alcance do controle externo em procedimentos consensuais. O debate ocorre no âmbito da Arguição de Descumprimento de Preceito Fundamental (ADPF) 1183, ajuizada pelo Partido Novo.</p>

      <p class="mb-4">A ação questiona a constitucionalidade da Instrução Normativa (IN) 91/2022 do Tribunal de Contas da União (TCU), que instituiu a Secretaria de Controle Externo de Solução Consensual e Prevenção de Conflitos (SecexConsenso). O partido argumenta que a norma expande indevidamente as atribuições da corte de contas, permitindo que o órgão participe da formulação de políticas públicas, uma competência do Executivo e Legislativo.</p>

      <p class="mb-4">Em contrapartida, o TCU e entidades como a Ordem dos Advogados do Brasil (OAB) defendem a iniciativa. Sustentam que a busca por soluções consensuais moderniza o controle externo, promove a eficiência administrativa e reduz a judicialização de grandes projetos de infraestrutura, mantendo-se dentro dos limites constitucionais.</p>

      <div class="my-6 p-4 bg-gray-50 border-l-4 border-secondary-500">
        <p class="italic text-gray-700">Em sustentação oral, a OAB e a AGU defenderam que o modelo consensual traz "maior racionalidade, eficiência e segurança jurídica", permitindo uma atuação preventiva do tribunal sem substituir o gestor público.</p>
      </div>

      <p class="mb-4">O relator da ação, ministro Edson Fachin, conduziu as oitivas que servirão de base para a futura decisão do plenário sobre o tema, que tem repercussão direta na atuação de todos os Tribunais de Contas do país.</p>

      <p class="text-sm text-gray-500 mt-4">Fonte: Notícias STF</p>
    `,
    date: '2026-02-13', // Today
    imageUrl: '/news/stf_consensus.jpg',
    category: NewsCategory.NA_MIDIA,
    isHighlight: false,
    author: 'Redação'
  }
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