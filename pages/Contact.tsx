import React from 'react';
import { MapPin, Phone, Mail, Send, Facebook, Instagram, ExternalLink, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Contact: React.FC = () => {
  const location = useLocation();
  const isSuccess = new URLSearchParams(location.search).get('success') === 'true';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 text-center">Fale Conosco</h1>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Estamos aqui para ouvir suas dúvidas, sugestões ou solicitações. Entre em contato pelos nossos canais oficiais ou envie uma mensagem abaixo.
        </p>

        {isSuccess && (
          <div className="max-w-5xl mx-auto mb-8 bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700 animate-fade-in">
            <CheckCircle className="shrink-0" size={24} />
            <div>
              <p className="font-bold">Mensagem enviada com sucesso!</p>
              <p className="text-sm opacity-90">Agradecemos o contato. Retornaremos em breve.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Informações de Contato</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Sede</h3>
                  <p className="text-gray-600 leading-relaxed mt-1">
                    Rua da Aurora, 985<br />
                    (esquina com a Travessa do Costa)<br />
                    Santo Amaro, Recife - PE<br />
                    CEP: 50040-090
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Rua+da+Aurora+985+Recife"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary-600 font-bold text-sm mt-3 hover:underline"
                  >
                    Ver no Google Maps <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">E-mail Oficial</h3>
                  <a href="mailto:auditores.sindical.tce.pe@gmail.com" className="text-gray-600 hover:text-primary-600 transition-colors break-all text-lg mt-1 block">
                    auditores.sindical.tce.pe@gmail.com
                  </a>
                  <p className="text-xs text-gray-400 mt-2">Atendimento prioritário para associados.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Telefone e WhatsApp</h3>
                  <p className="text-gray-600 text-lg mt-1">(81) 99163-0278</p>
                  <p className="text-xs text-gray-400 mt-1">Seg-Sex, 8h às 17h</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-sm">Nossas Redes Sociais</h3>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/auditores_tce_pe/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 p-4 rounded-xl transition-all hover:scale-110 shadow-sm"
                  title="Instagram"
                >
                  <Instagram size={22} />
                </a>
                <a 
                  href="https://www.facebook.com/auditorestcepe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 p-4 rounded-xl transition-all hover:scale-110 shadow-sm"
                  title="Facebook"
                >
                  <Facebook size={22} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-8 relative z-10">Envie uma Mensagem</h2>
            <form
              action="https://formsubmit.co/13ae6adc7181116bc0173267ef273d47"
              method="POST"
              className="space-y-5 relative z-10"
            >
              <input type="hidden" name="_subject" value="Novo contato via Site Auditores TCE-PE" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_language" value="pt" />
              <input type="hidden" name="_next" value={window.location.protocol + "//" + window.location.host + "/#/contato?success=true"} />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  placeholder="exemplo@portaltce.pe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Assunto</label>
                <select
                  name="subject_option"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                >
                  <option>Dúvidas Gerais</option>
                  <option>Filiação e Cadastro</option>
                  <option>Suporte ao Portal</option>
                  <option>Imprensa e Comunicação</option>
                  <option>Sugestões</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Mensagem</label>
                <textarea
                  rows={4}
                  name="message"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50/50"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-3 group"
              >
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;