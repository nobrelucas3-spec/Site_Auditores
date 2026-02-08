import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-8">

        {/* Info Column - Takes more space for text */}
        <div className="md:col-span-5">
          <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider border-b border-secondary-500 inline-block pb-1">Sobre Nós</h3>
          <p className="text-sm leading-relaxed mb-4 text-gray-400">
            A Associação dos Auditores de Controle Externo do TCE-PE trabalha incansavelmente pela valorização da carreira e pelo fortalecimento do controle externo em Pernambuco, atuando com ética, transparência e compromisso público.
          </p>
        </div>

        {/* Quick Links - Compact column */}
        <div className="md:col-span-3 lg:pl-8">
          <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider border-b border-secondary-500 inline-block pb-1">Links Úteis</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-secondary-400 transition-colors block py-1">Estatuto Social</a></li>
            <li><Link to="/area-do-filiado/financeiro" className="hover:text-secondary-400 transition-colors block py-1">Prestação de Contas</Link></li>
            <li><a href="#" className="hover:text-secondary-400 transition-colors block py-1">Clube de Vantagens</a></li>
            <li><a href="https://www.tce.pe.gov.br/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors block py-1">TCE-PE Oficial</a></li>
            <li><Link to="/contato" className="hover:text-secondary-400 transition-colors block py-1">Fale Conosco</Link></li>
          </ul>
        </div>

        {/* Contact - Needs space for address */}
        <div className="md:col-span-4">
          <h3 className="text-white text-lg font-bold mb-4 uppercase tracking-wider border-b border-secondary-500 inline-block pb-1">Contato</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <MapPin className="text-secondary-400 shrink-0 mt-1" size={18} />
              <span className="leading-relaxed">Rua da Aurora, 985<br />(esquina com a Travessa do Costa)<br />Santo Amaro, Recife - PE<br />CEP: 50040-090</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-secondary-400 shrink-0" size={18} />
              <span>(81) 99163-0278</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-secondary-400 shrink-0" size={18} />
              <span>auditores.sindical.tce.pe@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Associação dos Auditores de Controle Externo do TCE-PE. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
