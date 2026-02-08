import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_NEWS } from '../constants';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, ZoomIn } from 'lucide-react';
import ImageViewer from '../components/ImageViewer';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Find news by ID or use the specific one if it matches the LOAUD context
  const news = MOCK_NEWS.find(n => n.id === id);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentAlt, setCurrentAlt] = useState('');

  const openLightbox = (src: string, alt: string) => {
    setCurrentImage(src);
    setCurrentAlt(alt);
    setLightboxOpen(true);
  };

  if (!news) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Notícia não encontrada</h2>
        <Link to="/news" className="text-primary-600 hover:text-primary-800 font-medium hover:underline">
          &larr; Voltar para notícias
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  // Handle clicks on images inside the HTML content
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      openLightbox(img.src, img.alt);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ImageViewer
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageSrc={currentImage}
        imageAlt={currentAlt}
      />

      {/* Breadcrumb / Back Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-40">
        <div className="container mx-auto px-4 py-3">
          <Link to="/news" className="inline-flex items-center text-gray-500 hover:text-secondary-600 transition-colors text-sm font-medium group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Notícias
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-10 text-center animate-fade-in">
          <div className="flex justify-center gap-2 mb-6">
            <Link to={`/news?category=${news.category}`} className="bg-secondary-100 text-secondary-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase hover:bg-secondary-200 transition-colors">
              {news.category}
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight max-w-3xl mx-auto">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm border-y border-gray-200 py-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-secondary-500" />
              <time dateTime={news.date}>
                {new Date(news.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </div>
            {news.author && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-secondary-500" />
                <span>Por <span className="text-slate-900 font-semibold">{news.author}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">3 min de leitura</span>
            </div>
          </div>
        </header>

        <div
          className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl mb-12 bg-gray-200 relative group cursor-zoom-in"
          onClick={() => openLightbox(news.imageUrl, news.title)}
        >
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" size={48} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xl md:text-2xl text-slate-700 font-medium mb-8 leading-relaxed border-l-4 border-secondary-500 pl-6 italic bg-gray-50 py-4 rounded-r-lg">
            {news.summary}
          </p>

          <div
            className="prose prose-lg prose-slate prose-headings:text-slate-900 prose-a:text-secondary-600 hover:prose-a:text-secondary-700 prose-img:rounded-xl prose-img:cursor-zoom-in prose-strong:text-slate-900 font-serif leading-loose"
            dangerouslySetInnerHTML={{ __html: news.content }}
            onClick={handleContentClick}
          />

          <hr className="my-10 border-gray-100" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2 self-center">Tags:</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-default">TCE-PE</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-default">Auditoria</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-default">Controle Externo</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider hidden md:block">Compartilhar:</span>
              <button onClick={handleShare} className="p-2 text-gray-500 hover:text-white hover:bg-blue-600 rounded-full transition-all" title="Compartilhar no Facebook">
                <Facebook size={20} />
              </button>
              <button onClick={handleShare} className="p-2 text-gray-500 hover:text-white hover:bg-sky-500 rounded-full transition-all" title="Compartilhar no Twitter">
                <Twitter size={20} />
              </button>
              <button onClick={handleShare} className="p-2 text-gray-500 hover:text-white hover:bg-blue-700 rounded-full transition-all" title="Compartilhar no LinkedIn">
                <Linkedin size={20} />
              </button>
              <button onClick={handleShare} className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full transition-all" title="Copiar Link">
                <Copy size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Read More Section */}
        <div className="mt-16 max-w-4xl mx-auto border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">Leia também</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_NEWS.filter(n => n.id !== id).slice(0, 2).map(related => (
              <Link key={related.id} to={`/news/${related.id}`} className="group flex gap-4 items-start p-4 rounded-lg hover:bg-white hover:shadow-md transition-all">
                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                  <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-secondary-600 uppercase tracking-wide">{related.category}</span>
                  <h4 className="font-bold text-slate-900 leading-tight mt-1 group-hover:text-secondary-600 transition-colors line-clamp-2">
                    {related.title}
                  </h4>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(related.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </article>
    </div>
  );
};

export default Article;
