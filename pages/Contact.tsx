import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Linkedin, Instagram, ExternalLink } from 'lucide-react';

const Contact: React.FC = () => {
  // We don't strictly need state for FormSubmit as it works with native form submission, 
  // but we can use simple state if we wanted validation. 
  // For now, standard HTML5 validation and FormSubmit redirection is enough.

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Fale Conosco</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Informações de Contato</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Endereço</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Rua da Aurora, 885 - Boa Vista<br />
                    Recife - PE, 50050-000<br />
                    (Edifício do TCE-PE)
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Tribunal+de+Contas+do+Estado+de+Pernambuco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary-600 font-bold text-sm mt-2 hover:underline"
                  >
                    Ver no Google Maps <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">E-mail</h3>
                  <a href="mailto:auditores.sindical.tce.pe@gmail.com" className="text-gray-600 hover:text-primary-600 transition-colors break-all">
                    auditores.sindical.tce.pe@gmail.com
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Respondemos em até 24h úteis.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Telefone</h3>
                  <p className="text-gray-600">(81) 3181-7600</p>
                  <p className="text-xs text-gray-400 mt-1">Seg-Sex, 8h às 17h</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <button className="bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors">
                  <Instagram size={20} />
                </button>
                <button className="bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors">
                  <Facebook size={20} />
                </button>
                <button className="bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors">
                  <Linkedin size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Envie uma Mensagem</h2>
            <form
              action="https://formsubmit.co/auditores.sindical.tce.pe@gmail.com"
              method="POST"
              className="space-y-4"
            >
              {/* FormSubmit Configuration */}
              <input type="hidden" name="_subject" value="Novo contato via Site Auditores TCE-PE" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value="http://localhost:3000/convenios#/contato?success=true" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <select
                  name="subject_option"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                >
                  <option>Dúvidas Gerais</option>
                  <option>Filiação</option>
                  <option>Jurídico</option>
                  <option>Imprensa</option>
                  <option>Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  rows={4}
                  name="message"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send size={20} /> Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;