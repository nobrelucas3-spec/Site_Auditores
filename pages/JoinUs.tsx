import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const JoinUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-primary-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Fortaleça sua Categoria</h1>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto mb-8">
            Junte-se a nós na defesa do controle externo e aproveite benefícios exclusivos para auditores.
          </p>
          <button className="bg-secondary-500 text-primary-900 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-secondary-400 hover:scale-105 transition-all">
            Preencher Ficha de Filiação
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
             <h2 className="text-3xl font-bold text-slate-900 mb-6">Por que se associar?</h2>
             <div className="space-y-6">
                <div className="flex gap-4">
                   <CheckCircle className="text-secondary-500 shrink-0" size={28} />
                   <div>
                      <h3 className="font-bold text-lg text-slate-800">Defesa Jurídica</h3>
                      <p className="text-gray-600">Assessoria jurídica especializada em questões funcionais e administrativas.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <CheckCircle className="text-secondary-500 shrink-0" size={28} />
                   <div>
                      <h3 className="font-bold text-lg text-slate-800">Representatividade</h3>
                      <p className="text-gray-600">Atuação ativa junto ao TCE-PE e na Assembleia Legislativa em prol da carreira.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <CheckCircle className="text-secondary-500 shrink-0" size={28} />
                   <div>
                      <h3 className="font-bold text-lg text-slate-800">Clube de Vantagens</h3>
                      <p className="text-gray-600">Descontos em escolas, academias, planos de saúde e muito mais.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <CheckCircle className="text-secondary-500 shrink-0" size={28} />
                   <div>
                      <h3 className="font-bold text-lg text-slate-800">Eventos e Capacitação</h3>
                      <p className="text-gray-600">Acesso gratuito ou com desconto em cursos, seminários e congressos.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-lg">
             <h3 className="text-2xl font-bold text-primary-900 mb-6 text-center">Como funciona?</h3>
             <ol className="space-y-8 relative before:absolute before:left-4 before:top-2 before:h-full before:w-0.5 before:bg-gray-200">
                <li className="relative pl-12">
                   <span className="absolute left-0 top-0 bg-secondary-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">1</span>
                   <h4 className="font-bold text-lg">Preenchimento</h4>
                   <p className="text-sm text-gray-600">Preencha o formulário online com seus dados pessoais e funcionais.</p>
                </li>
                <li className="relative pl-12">
                   <span className="absolute left-0 top-0 bg-primary-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">2</span>
                   <h4 className="font-bold text-lg">Análise</h4>
                   <p className="text-sm text-gray-600">Nossa secretaria validará suas informações junto ao quadro do tribunal.</p>
                </li>
                <li className="relative pl-12">
                   <span className="absolute left-0 top-0 bg-primary-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">3</span>
                   <h4 className="font-bold text-lg">Aprovação</h4>
                   <p className="text-sm text-gray-600">Você receberá a confirmação e sua carteira digital de associado.</p>
                </li>
             </ol>
             <button className="w-full mt-8 bg-primary-900 text-white font-bold py-3 rounded-lg hover:bg-primary-800 transition-colors flex items-center justify-center gap-2">
                Começar agora <ArrowRight size={18} />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JoinUs;