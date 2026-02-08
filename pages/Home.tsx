import React, { useMemo } from 'react';
import HomeBanner from '../components/HomeBanner';
import QuickAccess from '../components/QuickAccess';
import NewsCard from '../components/NewsCard';
import { MOCK_NEWS, MOCK_ARTICLES, MOCK_AUDITS } from '../constants';
import { ArrowRight, Star, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  // Sort news by date (newest first)
  const sortedNews = useMemo(() => {
    return [...MOCK_NEWS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  // Get 2 most recent for banner
  const bannerNews = sortedNews.slice(0, 2);

  // Get all news for the list (chronological)
  // We display the first 6 in the grid
  const recentNewsList = sortedNews.slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-50">
      <HomeBanner featuredNews={bannerNews} />

      {/* News Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListFilter size={16} className="text-secondary-600" />
              <span className="text-secondary-600 font-semibold uppercase text-sm tracking-wide">Ordem Cronológica</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Últimas Notícias</h2>
          </div>
          <Link to="/news" className="hidden md:flex items-center gap-2 text-primary-700 font-bold hover:text-primary-900 transition-colors">
            Ver todas as notícias <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentNewsList.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/news" className="inline-flex items-center gap-2 text-primary-700 font-bold hover:text-primary-900">
            Ver todas <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Technical Articles Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-slate-900 border-l-4 border-secondary-500 pl-4">Análise Técnica & Opinião</h2>
            <Link to="/comunicacao/artigos" className="hidden md:flex items-center gap-2 text-primary-700 font-bold hover:text-primary-900 transition-colors">
              Ver todos <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_ARTICLES.map(article => (
              <Link key={article.id} to={article.link} className="group flex flex-col md:flex-row bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100">
                <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-0 left-0 bg-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg uppercase tracking-wide">
                    Em Destaque
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-center w-full md:w-3/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-semibold text-primary-700">{article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {article.summary}
                  </p>
                  <span className="text-secondary-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ler Artigo <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}

            {/* Placeholder for more articles or a call to action if only one exists */}
            <div className="bg-primary-900 rounded-xl p-8 flex flex-col justify-center items-start text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">Espaço do Associado</h3>
              <p className="text-primary-200 mb-6 relative z-10 max-w-sm">
                Publique seus artigos técnicos e de opinião. Contribua para o debate e fortalecimento do Controle Externo.
              </p>
              <Link to="/contato" className="bg-secondary-500 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors relative z-10">
                Submeter Artigo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Relevant Audits Section */}
      <section className="py-16 bg-slate-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-secondary-600 font-bold uppercase tracking-wider text-sm mb-2 block">Transparência e Resultados</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Auditorias em Destaque</h2>
            <p className="text-gray-600">Conheça os trabalhos de fiscalização que geram impacto positivo para a sociedade pernambucana.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_AUDITS.filter(a => a.status === 'Concluída').map(audit => (
              <Link key={audit.id} to={`/auditorias/${audit.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col md:flex-row h-full md:h-52">
                <div className="w-full md:w-1/3 h-48 md:h-full relative overflow-hidden">
                  <img src={audit.image} alt={audit.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-0 left-0 m-3 px-2 py-1 bg-green-500 text-white text-[10px] uppercase font-bold rounded shadow-sm">
                    {audit.status}
                  </div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs text-secondary-600 font-semibold mb-2">
                    <Star size={12} className="fill-secondary-600" />
                    <span>Destaque</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400 font-normal">{new Date(audit.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors leading-tight">
                    {audit.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {audit.summary}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 group-hover:translate-x-1 transition-transform">
                    Ler na íntegra <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <QuickAccess />

      {/* Social Media Section */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Siga-nos nas Redes Sociais</h2>
          <p className="text-gray-600 mb-8">Acompanhe nosso dia a dia e fique por dentro das novidades.</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto mb-8">
            {[
              { id: 'DUWQqwXEW6t', img: 'conacon_2026.jpg', text: '9º CONACON 2026' },
              { id: 'DQerrT9jVLR', img: 'DQerrT9jVLR.jpg', text: 'Inauguração Sede' },
              { id: 'DUaubczDiNu', img: 'DUaubczDiNu.jpg', text: 'Visita TCE-PE' },
              { id: 'DTlfCdrj4v0', img: 'DTlfCdrj4v0.jpg', text: 'Encontro ANTC' },
              { id: 'DTlRJ65jzMn', img: 'DTlRJ65jzMn.jpg', text: 'Posse Presidente' },
              { id: 'DQfEPChkbji', img: 'DQfEPChkbji.jpg', text: 'Fortalecendo Laços' },
              { id: 'DQfZI6iD-oA', img: 'DQfZI6iD-oA.jpg', text: 'Casa do Auditor' },
              { id: 'DSprN6QjUcz', img: 'DSprN6QjUcz.jpg', text: 'Boas Festas' },
              { id: 'DSaomXUD4HQ', img: 'DSaomXUD4HQ.jpg', text: 'Sucesso Gestão' },
              { id: 'DQVkhyYjaN3', img: 'DQVkhyYjaN3.jpg', text: 'Dia do Servidor' },
            ].map((post) => (
              <a
                key={post.id}
                href={post.id === 'DUWQqwXEW6t' ? 'https://www.instagram.com/auditorestce.pe/p/DUWQqwXEW6t/' : `https://www.instagram.com/p/${post.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg block"
              >
                <img
                  src={`/social/${post.img}`}
                  alt={post.text}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold p-2">
                  <span className="text-center text-xs md:text-sm">{post.text}</span>
                </div>
              </a>
            ))}
          </div>

          <a
            href="https://www.instagram.com/auditorestce.pe/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors"
          >
            @auditorestce.pe
          </a>
        </div>
      </section>
    </main>
  );
};

export default Home;