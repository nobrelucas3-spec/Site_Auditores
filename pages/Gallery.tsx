import React, { useState } from 'react';
import { Image as ImageIcon, PlayCircle, X, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { PHOTO_ALBUMS } from '../constants';

interface GalleryProps {
  type: 'fotos' | 'videos';
}

const Gallery: React.FC<GalleryProps> = ({ type }) => {
  const isVideo = type === 'videos';
  const title = isVideo ? 'Galeria de Vídeos' : 'Galeria de Fotos';
  const Icon = isVideo ? PlayCircle : ImageIcon;

  const [selectedAlbum, setSelectedAlbum] = useState<typeof PHOTO_ALBUMS[0] | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const openAlbum = (album: typeof PHOTO_ALBUMS[0]) => {
    setSelectedAlbum(album);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setActivePhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAlbum && activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % selectedAlbum.photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAlbum && activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
    }
  };

  if (isVideo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6 py-20">
             <div className="bg-primary-50 p-6 rounded-full text-primary-400">
               <PlayCircle size={64} />
             </div>
             <h1 className="text-4xl font-black text-slate-900">Em Breve</h1>
             <p className="text-gray-500 max-w-md">Estamos processando os registros em vídeo de nossas assembleias e eventos para disponibilizar o acervo completo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary-900 text-white p-3 rounded-2xl shadow-lg">
              <Icon size={32} />
            </div>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">
                <span className="cursor-pointer hover:text-primary-800" onClick={closeAlbum}>Galeria</span>
                {selectedAlbum && (
                  <>
                    <ChevronRight size={12} />
                    <span className="text-slate-400">{selectedAlbum.title}</span>
                  </>
                )}
              </nav>
              <h1 className="text-3xl font-black text-slate-900">
                {selectedAlbum ? selectedAlbum.title : 'Nossos Registros'}
              </h1>
            </div>
          </div>
          
          {selectedAlbum && (
            <button 
              onClick={closeAlbum}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} /> Voltar para Álbuns
            </button>
          )}
        </div>

        {/* Album Grid View */}
        {!selectedAlbum ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PHOTO_ALBUMS.map((album) => (
              <div 
                key={album.id} 
                onClick={() => openAlbum(album)}
                className="group cursor-pointer bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={album.cover} 
                    alt={album.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                      {album.photos.length} fotos
                    </span>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-black tracking-tighter opacity-80">
                      <Calendar size={10} /> {new Date(album.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">{album.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{album.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Photo Grid View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {selectedAlbum.photos.map((photo, index) => (
                <div 
                  key={index} 
                  onClick={() => setActivePhotoIndex(index)}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
                >
                  <img 
                    src={photo} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/40 text-white">
                      <Camera size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && selectedAlbum && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-50 p-2"
          >
            <X size={40} />
          </button>
          
          <button 
            onClick={prevPhoto}
            className="absolute left-4 md:left-10 text-white/40 hover:text-white transition-colors p-4"
          >
            <ChevronLeft size={48} />
          </button>
          
          <div className="max-w-[90vw] max-h-[85vh] relative flex items-center justify-center">
            <img 
              src={selectedAlbum.photos[activePhotoIndex]} 
              alt="Foto ampliada" 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
            />
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white/60 text-sm font-medium">
              Foto {activePhotoIndex + 1} de {selectedAlbum.photos.length} — {selectedAlbum.title}
            </div>
          </div>
          
          <button 
            onClick={nextPhoto}
            className="absolute right-4 md:right-10 text-white/40 hover:text-white transition-colors p-4"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;