import React from 'react';
import { Image, PlayCircle } from 'lucide-react';

interface GalleryProps {
  type: 'fotos' | 'videos';
}

const Gallery: React.FC<GalleryProps> = ({ type }) => {
  const isVideo = type === 'videos';
  const title = isVideo ? 'Galeria de Vídeos' : 'Galeria de Fotos';
  const Icon = isVideo ? PlayCircle : Image;

  // Mock items
  const items = Array(6).fill(null).map((_, i) => ({
    id: i,
    title: isVideo ? `Cobertura do Evento ${i + 1}` : `Congresso Nacional ${i + 1}`,
    date: '20/10/2023',
    image: `https://picsum.photos/400/300?random=${i + (isVideo ? 10 : 0)}`
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-white p-3 rounded-full shadow-sm text-secondary-500">
             <Icon size={32} />
           </div>
           <h1 className="text-3xl font-bold text-primary-900 capitalize">{title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
               <div className="relative h-56 overflow-hidden">
                 <img 
                   src={item.image} 
                   alt={item.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    {isVideo && <div className="bg-white/90 rounded-full p-3 text-primary-900"><PlayCircle size={32} /></div>}
                 </div>
               </div>
               <div className="p-4">
                 <span className="text-xs text-gray-500 block mb-1">{item.date}</span>
                 <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors">{item.title}</h3>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;