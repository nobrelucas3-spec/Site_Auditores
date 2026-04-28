import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { PARTNERS } from '../constants';
import { Tag, ExternalLink, X, Send, Lock, ShieldCheck } from 'lucide-react';
import { PartnerLink } from '../types';

const Agreements: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPartner, setSelectedPartner] = React.useState<PartnerLink | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoggedOutModalOpen, setIsLoggedOutModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ nome: '', matricula: '' });
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const categories = ['Todos', 'Educação', 'Saúde', 'Lazer e Esportes', 'Serviços'];
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Buscar dados do membro logado
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .ilike('email', session.user.email)
          .maybeSingle();
        
        if (memberData) {
          setMember(memberData);
          setFormData({ nome: memberData.full_name, matricula: memberData.matricula });
        }
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const handleContactClick = (partner: PartnerLink) => {
    if (!member) {
      setSelectedPartner(partner);
      setIsLoggedOutModalOpen(true);
      return;
    }
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleWhatsAppRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se for um parceiro com link direto (ex: Wellhub)
    if (selectedPartner?.link) {
      window.open(selectedPartner.link, '_blank');
      setIsModalOpen(false);
      return;
    }

    // Se for contato via WhatsApp
    const text = `Olá! Sou ${formData.nome} (Matrícula: ${formData.matricula}). Gostaria de saber mais informações sobre o convênio da ${selectedPartner?.name}.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/558191630278?text=${encodedText}`, '_blank');
    setIsModalOpen(false);
  };

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

        {/* Categorias Dinâmicas */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all border shadow-sm ${
                activeCategory === cat
                  ? 'bg-secondary-500 text-primary-900 border-secondary-600 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNERS.filter(p => activeCategory === 'Todos' || p.category === activeCategory).map((partner, idx) => (
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
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-2">
                  <Tag size={14} className="shrink-0" />
                  <span className="truncate">{partner.discount}</span>
                </div>
                {partner.description && (
                  <div className="text-gray-600 text-xs mb-4 flex-grow" dangerouslySetInnerHTML={{ __html: partner.description }}>
                  </div>
                )}
                
                {partner.link ? (
                  <button 
                    onClick={() => handleContactClick(partner)}
                    className="mt-auto w-full bg-primary-600 text-white text-center font-bold py-2 rounded hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    Aderir ao Convênio <ExternalLink size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleContactClick(partner)}
                    className="mt-auto w-full border border-primary-500 text-primary-600 font-semibold py-2 rounded hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-sm text-center"
                  >
                    Contatar Secretaria <ExternalLink size={14} />
                  </button>
                )}
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

      {/* Identificação Modal (Para Logados) */}
      {isModalOpen && member && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-primary-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Confirmar Identidade</h3>
                <p className="text-primary-200 text-sm">Olá, {member.full_name.split(' ')[0]}!</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleWhatsAppRedirect} className="p-8">
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Nome Completo</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium">
                  {member.full_name}
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Matrícula</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-mono font-bold">
                  {member.matricula}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mb-8 border border-green-100 flex items-start gap-3 text-left">
                <ShieldCheck size={20} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 leading-relaxed">
                  Sua identidade foi verificada via <strong>Área do Filiado</strong>. O contato será enviado com sua matrícula oficial.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-secondary-500 text-primary-900 font-extrabold py-4 rounded-xl shadow-lg hover:bg-secondary-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {selectedPartner?.link ? 'Acessar Formulário de Adesão' : 'Prosseguir para o WhatsApp'} 
                {selectedPartner?.link ? <ExternalLink size={20} /> : <Send size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Aviso de Área Restrita (Para Não Logados) */}
      {isLoggedOutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Área Restrita</h3>
              <p className="text-gray-600 mb-8">
                O Clube de Vantagens é um benefício exclusivo para os auditores filiados. 
                Por favor, realize o login para acessar as informações de convênio.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/area-do-filiado')}
                  className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-primary-700 transition-all"
                >
                  Fazer Login Agora
                </button>
                <button 
                  onClick={() => setIsLoggedOutModalOpen(false)}
                  className="w-full bg-white text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agreements;