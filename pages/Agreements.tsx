import React from 'react';
import { PARTNERS } from '../constants';
import { Tag, ExternalLink } from 'lucide-react';

const Agreements: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">Clube de Vantagens</h1>
          <p className="text-gray-600">
            Nossos associados contam com descontos e benefícios exclusivos em uma ampla rede de parceiros.
            Apresente sua carteira virtual para aproveitar.
          </p>
        </div>

        {/* Categories (Mock filters) */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
           <button className="px-4 py-2 rounded-full bg-secondary-500 text-primary-900 font-bold shadow-md">Todos</button>
           <button className="px-4 py-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">Educação</button>
           <button className="px-4 py-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">Saúde</button>
           <button className="px-4 py-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">Lazer</button>
           <button className="px-4 py-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200">Serviços</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNERS.map((partner, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col overflow-hidden group">
              <div className="h-40 overflow-hidden relative bg-gray-100 flex items-center justify-center p-4">
                <img 
                  src={partner.image} 
                  alt={partner.name} 
                  className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-primary-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                    {partner.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{partner.name}</h3>
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-4">
                  <Tag size={14} />
                  {partner.discount}
                </div>
                <button className="mt-auto w-full border border-primary-500 text-primary-600 font-semibold py-2 rounded hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  Ver Detalhes <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Call to action for partners */}
          <div className="bg-primary-50 rounded-xl border-2 border-dashed border-primary-200 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <h3 className="font-bold text-primary-800 text-lg mb-2">Quer ser um parceiro?</h3>
            <p className="text-sm text-primary-600 mb-4">
              Ofereça benefícios para uma categoria qualificada e divulgue sua marca.
            </p>
            <button className="bg-primary-600 text-white font-bold py-2 px-6 rounded hover:bg-primary-700 transition-colors">
              Propor Convênio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agreements;