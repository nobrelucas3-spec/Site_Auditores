import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-[500px] w-full bg-slate-900 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url('https://picsum.photos/1920/1080?grayscale')` }}
      ></div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-transparent"></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pb-16">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block bg-secondary-500 text-primary-900 text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider">
            Institucional
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Fortalecendo o Controle Externo em Pernambuco
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-xl">
            Unindo forças para garantir a ética, a transparência e a valorização do auditor no serviço público.
          </p>
          <div className="flex gap-4">
            <button className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 font-bold py-3 px-8 rounded shadow-lg transition-transform hover:-translate-y-1">
              Associe-se Agora
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded transition-colors">
              Saiba Mais
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
