import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UnderConstructionProps {
    title: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ title }) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full animate-fade-in border border-gray-100">
                <div className="bg-secondary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-secondary-600">
                    <Construction size={40} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
                <p className="text-gray-500 mb-8">
                    Estamos trabalhando duro para trazer este conteúdo para você. Em breve teremos novidades!
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-800 transition-colors hover:underline"
                >
                    <ArrowLeft size={18} /> Voltar para o Início
                </Link>
            </div>
        </div>
    );
};

export default UnderConstruction;
