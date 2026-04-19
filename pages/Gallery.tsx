import React from 'react';
import { Image, PlayCircle } from 'lucide-react';

interface GalleryProps {
  type: 'fotos' | 'videos';
}

const Gallery: React.FC<GalleryProps> = ({ type }) => {
  const isVideo = type === 'videos';
  const title = isVideo ? 'Galeria de Vídeos' : 'Galeria de Fotos';
  const Icon = isVideo ? PlayCircle : Image;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-white p-3 rounded-full shadow-sm text-secondary-500">
             <Icon size={32} />
           </div>
           <h1 className="text-3xl font-bold text-primary-900 capitalize">{title}</h1>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto relative">
              <img 
                src="/placeholders/gallery_coming_soon.png" 
                alt="Galeria em Produção" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary-900/10"></div>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-700 px-4 py-1.5 rounded-full text-sm font-bold w-fit mx-auto md:mx-0 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-500"></span>
                </span>
                Em Produção
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                Estamos preparando este acervo para você
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                Nossa equipe está organizando as coberturas de eventos, assembleias e registros históricos. Em breve, você poderá visualizar todas as fotos e vídeos da nossa associação aqui.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-primary-100 flex items-center justify-center text-primary-600">
                    <Icon size={18} />
                  </div>
                  <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-slate-400">
                    <Icon size={18} />
                  </div>
                </div>
                <span className="text-sm text-gray-500 font-medium italic">Novos registros em breve...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;