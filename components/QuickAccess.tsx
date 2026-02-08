import React from 'react';
import { UserCheck, Scale, Handshake, FileBarChart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../constants';

const iconMap: Record<string, React.ReactNode> = {
  'UserCheck': <UserCheck size={32} />,
  'Scale': <Scale size={32} />,
  'Handshake': <Handshake size={32} />,
  'FileBarChart': <FileBarChart size={32} />,
};

const QuickAccess: React.FC = () => {
  return (
    <section className="py-8 md:py-12 bg-gray-50 container mx-auto px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 border-t-4 border-secondary-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-900 uppercase">Acesso Rápido</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <Link
              key={index}
              to={service.link}
              className="group flex flex-col items-center text-center p-6 border border-gray-100 rounded-lg hover:shadow-lg hover:border-secondary-400 transition-all duration-300 bg-gray-50 hover:bg-white"
            >
              <div className="mb-4 h-32 w-32 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {service.image ? (
                  <img src={service.image} alt={service.title} className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                  <div className="text-primary-700 group-hover:text-secondary-500 transition-colors">
                    {/* Fallback if no image */}
                    {service.iconName && iconMap[service.iconName]}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{service.description}</p>
              <div className="mt-auto text-primary-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Acessar <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
