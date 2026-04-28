import { NewsCategory, NewsItem, ServiceLink, PartnerLink } from './types';

export const BOARD_MEMBERS = [
  { name: 'Roubier Muniz de Souza', role: 'Presidente', image: '/diretoria/roubier_muniz.png' },
  { name: 'Nelson Barreto Coutinho Bezerra de Menezes', role: 'Vice-Presidente', image: '/logo.png' },
  { name: 'Lucas Nobre de Almeida', role: 'Diretor Administrativo-Financeiro', image: '/diretoria/lucas_nobre.jpg' },
  { name: 'Talita Hermógenes Fernandes', role: 'Diretora para Assuntos Técnicos e Jurídicos', image: '/logo.png' },
];

export const FISCAL_COUNCIL_ASSOCIATION = [
  'Camila Cômodo Ferrari Sabino',
  'Eliana Maria de Paula',
  'Francisco José Gominho Rosa'
];

export const FISCAL_COUNCIL_SYNDICATE = [
  'Camila Cômodo Ferrari Sabino',
  'Eliana Maria de Paula',
  'Francisco José Gominho Rosa',
  'Adolfo Luiz Souza de Sá',
  'José Ricardo Borges de Oliveira'
];

export const PARTNERS: PartnerLink[] = [
  { 
    name: 'Wellhub (Antigo Gympass) via Clubs', 
    discount: 'Planos corporativos a partir de R$ 35,90', 
    category: 'Saúde e Bem-estar', 
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600',
    link: 'https://docs.google.com/forms/d/1IVmD_b8Ocnweqz9iatppaZxoJik1ZXNoYSerLl8RRDY/viewform',
    description: `
      <p class="mb-2">Benefício exclusivo via parceria ANTC/Clubs para promoção da saúde e qualidade de vida.</p>
      <p class="mb-2"><strong>Como aderir:</strong></p>
      <ol class="list-decimal pl-4 space-y-1 mb-3">
        <li>Preencha o formulário de adesão oficial.</li>
        <li>Aguarde o contato da ANTC (prazo médio de 3 dias úteis).</li>
        <li>Siga as instruções enviadas por e-mail para ativar sua conta.</li>
      </ol>
      <p class="text-primary-700 font-bold mb-1">Dúvidas? (61) 2017-6600</p>
      <p class="text-xs text-gray-500 italic"><a href="https://wellhub.com/pt-br/search/" target="_blank" class="underline">Clique aqui para buscar academias</a></p>
    `
  },
  {
    name: 'Universidade Católica de Pernambuco',
    discount: 'Descontos especiais em graduação e pós',
    category: 'Educação',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
    description: '<p>Condições exclusivas para associados e dependentes em cursos de graduação, especialização, mestrado e doutorado oferecidos pela Unicap.</p>'
  },
  {
    name: 'ACE-Clube Escola de Tênis Ltda',
    discount: 'Condições especiais para aulas e locações',
    category: 'Lazer e Esportes',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
    description: '<p>Descontos especiais na matrícula, aulas e aluguel de quadras para a prática esportiva.</p>'
  },
  {
    name: 'AABB – Associação Atlética Banco do Brasil',
    discount: 'Isenção na joia e descontos na mensalidade',
    category: 'Lazer e Esportes',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=600',
    description: '<p>Acesso completo à infraestrutura de lazer, esportes e eventos da AABB Recife para o filiado e sua família com valor subsidiado.</p>'
  },
  {
    name: 'Uniodonto Recife',
    discount: 'Planos odontológicos empresariais',
    category: 'Saúde',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=600',
    description: '<p>Ampla cobertura odontológica com rede credenciada de excelência e mensalidades com desconto direto para os associados.</p>'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'conacon-2026',
    title: 'Vem aí o 9º CONACON em Curitiba! Manifeste seu interesse em participar',
    summary: 'A Associação convoca os auditores a manifestarem interesse em participar do maior evento de Controle Externo do Brasil. Preencha o formulário para facilitar nossa articulação institucional.',
    content: '',
    date: '2026-04-28',
    imageUrl: '/news/conacon2026.png',
    category: NewsCategory.EVENTOS,
    isHighlight: true,
    author: 'Diretoria',
    customLink: '/conacon'
  },
  {
    id: 'dia-do-auditor-integracao-2026',
    title: 'Auditores do Tribunal de Contas de Pernambuco celebram data com evento de integração',
    summary: 'Encontro destacou o papel dos auditores como fiscais da sociedade e reforçou a importância da independência do controle externo.',
    content: `
      <p class="mb-4">A Associação dos Auditores de Controle Externo do Tribunal de Contas de Pernambuco realizou, nesta segunda-feira (27), um encontro especial em comemoração ao Dia do Auditor de Controle Externo.</p>
      
      <div class="my-8">
        <img src="/news/dia-do-auditor-2026.jpg" alt="Encontro do Dia do Auditor" class="w-full h-auto rounded-lg shadow-md mb-2" />
        <p class="text-sm text-gray-500 text-center italic">Roubier Muniz, presidente da Associação dos Auditores de Controle Externo; Francisco Gominho, fundador da Associação e Lilian Santiago, diretora da Associação Nacional dos Auditores de Controle Externo dos Tribunais de Conta do Brasil.</p>
      </div>

      <p class="mb-4">O evento reuniu associados na Casa do Auditor, em Santo Amaro, em um momento de confraternização, integração e fortalecimento institucional da categoria.</p>
      
      <p class="mb-4">Durante o encontro, foi reforçado que a data vai além de uma celebração. Para o presidente da Associação, Roubier Muniz, o momento também é de resgate histórico e de reafirmação do propósito da profissão.</p>
      
      <p class="mb-4">“O 27 de abril nos remete a 1893, a um gesto que definiu o DNA da nossa profissão: a defesa da independência do controle externo. O controle externo não existe sem independência e essa deve ser sempre fiel ao interesse público”, destacou.</p>
      
      <p class="mb-4">O presidente também enfatizou o papel essencial dos auditores na sociedade.<br/>“Inspirados por esse legado, carregamos hoje o título que tanto nos orgulha: nós somos os fiscais da sociedade", afirmou.</p>
      
      <p class="mb-4">Ele ainda ressaltou que a atuação vai além dos números e relatórios.<br/>“Não estamos apenas lidando com processos fiscais. Estamos defendendo o patrimônio público e garantindo que o imposto pago com tanto esforço pelo cidadão se transforme em serviços de qualidade".</p>
      
      <p>Roubier Muniz também destacou os desafios da profissão e a importância da responsabilidade no exercício da função. Por fim, reforçou o valor da categoria e o orgulho da instituição.<br/>“O Tribunal de Contas só é a instituição forte e respeitada que é hoje porque tem, em sua base, os Auditores de Controle Externo”, concluiu.</p>
    `,
    date: '2026-04-28',
    imageUrl: '/news/dia-do-auditor-2026.jpg',
    imagePosition: 'top',
    hideCoverInArticle: true,
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Diretoria'
  },
  {
    id: 'valorizacao-carreira-negociacao-2026',
    title: 'Associação dos Auditores reforça atuação e acompanha negociações pela valorização da carreira no TCE-PE',
    summary: 'Entidade segue em diálogo com a gestão do Tribunal e atenta às etapas institucionais necessárias para o avanço das tratativas',
    content: `
      <p class="mb-4">A Associação dos Auditores do Tribunal de Contas do Estado de Pernambuco (TCE-PE) segue atuando de forma permanente nas tratativas com a Alta Gestão do Tribunal, com foco na valorização da carreira de Auditor de Controle Externo.</p>
      
      <p class="mb-4">As discussões vêm sendo conduzidas com base em critérios técnicos, evidenciando a viabilidade de avanços dentro da realidade orçamentária da instituição. Apesar de um cenário fiscal positivo, fatores externos ainda influenciam o andamento das negociações, exigindo diálogo contínuo e atuação estratégica.</p>
      
      <p class="mb-4">O processo também envolve etapas institucionais que dependem de apreciação no âmbito legislativo, o que reforça a importância de acompanhamento atento e atuação articulada ao longo de todo o ciclo.</p>
      
      <p class="mb-4">Dessa forma, a Associação mantém sua atuação firme e responsável, representando os interesses da categoria e contribuindo de forma propositiva para o avanço das discussões.</p>
      
      <p class="mb-4">A entidade também segue atenta aos desafios enfrentados pela carreira, especialmente no que diz respeito à sua valorização e ao fortalecimento institucional, aspectos fundamentais para a manutenção da qualidade e da eficiência do controle externo.</p>
      
      <p>A Associação dos Auditores do TCE-PE reafirma seu compromisso com a defesa dos seus associados e continuará acompanhando de perto cada etapa das negociações.</p>
    `,
    date: '2026-04-12',
    imageUrl: '/news/valorizacao_carreira_reuniao.png',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Diretoria'
  },
  {
    id: 'nota-repudio-tce-pr-2026',
    title: 'Auditores de Pernambuco apoiam posicionamento da ANTC em defesa da legalidade no TCE-PR',
    summary: 'Nomeação fora da carreira acende alerta sobre riscos à legalidade e à credibilidade do controle externo no país.',
    content: `
      <p class="mb-4">Nomeação fora da carreira acende alerta sobre riscos à legalidade e à credibilidade do controle externo no país.</p>
      
      <p class="mb-4">O caso envolve a designação de servidor comissionado, não integrante da carreira de Auditor de Controle Externo, para o exercício de funções típicas de auditoria e fiscalização - atividades que, conforme entendimento consolidado do Supremo Tribunal Federal, especialmente no julgamento da ADI 6655, são de atribuição exclusiva de auditores de carreira.</p>
      
      <p class="mb-4">A ocupação dessas funções por agentes estranhos à carreira viola parâmetros constitucionais, legais e jurisprudenciais que estruturam o controle externo no Brasil. Tais garantias são essenciais para assegurar a independência, a imparcialidade e a qualificação técnica necessárias ao adequado exercício da atividade fiscalizatória.</p>
      
      <p class="mb-4">Dessa forma, considera-se legítima e necessária a atuação da ANTC ao se posicionar publicamente sobre o caso, diante da relevância institucional do tema e dos impactos potenciais sobre a credibilidade do Sistema Tribunais de Contas.</p>
      
      <p class="mb-4">Reforça-se que o respeito à Constituição, à legislação vigente e à jurisprudência consolidada deve prevalecer sobre quaisquer interpretações administrativas ou normas internas que venham a flexibilizar essas garantias.</p>
      
      <p class="mb-4">Por fim, há confiança nas providências adotadas junto ao Ministério Público do Estado do Paraná para o restabelecimento da legalidade, reafirmando o compromisso com a defesa das prerrogativas dos Auditores de Controle Externo e com a integridade do controle externo brasileiro.</p>
      
      <p class="mb-4 mt-6">Veja a nota na íntegra: <a href="https://www.antcbrasil.org.br/images/2026/04/Nota_Publica_Parana_ANTC-CR_assinado_assinado_29_a_260408_070043_assinado_assinado_28129_assinado.pdf" target="_blank" class="text-primary-600 hover:text-primary-800 underline font-semibold">Descarregar PDF - Nota pública de repúdio à nomeação irregular no TCE-PR</a></p>
    `,
    date: '2026-04-08',
    imageUrl: '/news/tce_pr_repudio.jpg',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Auditores TCE-PE'
  },
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
    date: '2026-04-27',
    imageUrl: '/news/new_website_launch.png',
    category: NewsCategory.INSTITUCIONAL,
    isHighlight: true,
    author: 'Assessoria de Comunicação'
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
    title: 'Associe-se',
    image: '/access/membership.png',
    description: 'Faça parte da associação e fortaleça a nossa carreira.',
    link: '/associe-se'
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
    date: '2026-04-09',
    summary: 'Análise sobre a constitucionalidade da transposição de cargos e funções de chefia.',
    link: '/area-do-filiado/analise-tecnica/inversao-hierarquica',
    image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=800',
    isPublic: false
  },
  {
    id: 'calices-de-privilegio',
    title: 'Cálices de privilégio e copos de plástico: quando o macro ignora o ralo da execução',
    author: 'Rafael Barbosa Brito da Matta',
    date: '2026-04-14',
    summary: 'O Estado brasileiro pode ser perfeitamente compreendido através da metáfora da "hidráulica social". Imagine o erário, o recurso público...',
    link: '/comunicacao/artigos/calices-de-privilegio',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    isPublic: true
  }
];