import React from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">Fale Conosco</h1>
        <p className="text-gray-600 mb-12">Estamos à disposição para atender você. Entre em contato por um dos canais abaixo.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Info & Form */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-primary-800 mb-6">Informações de Contato</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Endereço</h3>
                    <p className="text-gray-600">Rua da Aurora, 885 - Boa Vista</p>
                    <p className="text-gray-600">Recife - PE, 50050-000</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Telefones</h3>
                    <p className="text-gray-600">(81) 3333-0000</p>
                    <a 
                      href="https://wa.me/5581999999999" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      WhatsApp Atendimento
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">E-mail</h3>
                    <p className="text-gray-600">contato@associacao.org.br</p>
                    <p className="text-gray-600">juridico@associacao.org.br</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Horário de Funcionamento</h3>
                    <p className="text-gray-600">Segunda a Sexta: 08h às 17h</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social Media CTA */}
            <div className="bg-secondary-500 p-8 rounded-xl shadow-lg text-primary-900">
               <h3 className="font-bold text-xl mb-2">Siga-nos nas Redes Sociais</h3>
               <p className="mb-4 text-primary-800">Fique por dentro de tudo que acontece em tempo real.</p>
               <div className="flex gap-4">
                 <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors text-white"><InstagramIcon /></button>
                 <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors text-white"><FacebookIcon /></button>
                 <button className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors text-white"><LinkedinIcon /></button>
               </div>
            </div>
          </div>

          {/* Map & Form */}
          <div className="space-y-8">
            
             {/* Map Placeholder - Using static image for visual representation */}
            <div className="bg-gray-200 w-full h-64 rounded-xl overflow-hidden shadow-inner relative group">
                <img 
                  src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Mapa de Localização" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <a href="https://maps.google.com" target="_blank" className="bg-white px-4 py-2 rounded shadow-md font-bold text-primary-900 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <MapPin size={18} /> Ver no Google Maps
                    </a>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-primary-800 mb-6">Envie uma Mensagem</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                    <option>Dúvidas Gerais</option>
                    <option>Jurídico</option>
                    <option>Imprensa</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Como podemos ajudar?"></textarea>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                  <Send size={18} /> Enviar Mensagem
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Simple icon components for this file
const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const LinkedinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;


export default Contact;