import React, { ReactNode } from 'react';
import { Quote, AlertTriangle, Scale, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const SectionHeader: React.FC<{ title: string; id: string }> = ({ title, id }) => (
    <h2 id={id} className="text-3xl font-serif font-bold text-primary-900 mt-12 mb-6 scroll-mt-32 border-b border-gray-200 pb-2">
        {title}
    </h2>
);

export const SubSectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">
        {title}
    </h3>
);

export const Paragraph: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
    <p className={`text-lg text-gray-700 leading-relaxed mb-6 font-serif ${className}`}>
        {children}
    </p>
);

export const PullQuote: React.FC<{ text: string }> = ({ text }) => (
    <div className="my-10 relative">
        <Quote className="absolute -top-4 -left-4 text-secondary-200 w-12 h-12 transform -scale-x-100" />
        <blockquote className="relative z-10 text-2xl font-serif italic text-primary-800 text-center px-8 leading-normal">
            "{text}"
        </blockquote>
    </div>
);

export const InfoBox: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-sky-50 border-l-4 border-primary-500 p-6 my-8 rounded-r-lg">
        <h4 className="flex items-center gap-2 font-bold text-primary-900 mb-3 uppercase text-sm tracking-wide">
            <UserCheck size={18} /> {title}
        </h4>
        <div className="text-gray-700 text-sm">
            {children}
        </div>
    </div>
);

export const AlertBox: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
        <h4 className="flex items-center gap-2 font-bold text-amber-900 mb-3 uppercase text-sm tracking-wide">
            <AlertTriangle size={18} /> {title}
        </h4>
        <div className="text-amber-900 font-serif italic text-lg">
            {children}
        </div>
    </div>
);

export const CaseStudyCard: React.FC<{ title: string; subtitle: string; content: string; outcome: string }> = ({ title, subtitle, content, outcome }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 my-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div>
                <h4 className="font-bold text-lg text-slate-900">{title}</h4>
                <span className="text-xs text-gray-500 font-medium uppercase">{subtitle}</span>
            </div>
            <Scale className="text-primary-200" size={24} />
        </div>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {content}
        </p>
        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2 text-sm font-semibold text-green-800">
            <ArrowRight size={16} /> {outcome}
        </div>
    </div>
);

export const ComparisonTable: React.FC = () => (
    <div className="overflow-x-auto my-8 border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-primary-900 text-white uppercase text-xs">
                <tr>
                    <th className="px-6 py-3">Critério</th>
                    <th className="px-6 py-3 bg-primary-800">Auditor de Controle Externo</th>
                    <th className="px-6 py-3">Analista (Ex-Técnico/Prog)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-gray-900">Natureza do Cargo</td>
                    <td className="px-6 py-4 bg-blue-50 text-primary-900 font-semibold">Técnica de Nível Superior (Complexidade Plena)</td>
                    <td className="px-6 py-4 text-gray-600">Suporte Técnico e Administrativo</td>
                </tr>
                <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">Requisito de Ingresso</td>
                    <td className="px-6 py-4 bg-blue-50 text-primary-900 font-semibold">Nível Superior Específico</td>
                    <td className="px-6 py-4 text-gray-600">Nível Médio (Originalmente) / Superior Genérico</td>
                </tr>
                <tr className="bg-white">
                    <td className="px-6 py-4 font-bold text-gray-900">Atribuição Principal</td>
                    <td className="px-6 py-4 bg-blue-50 text-primary-900 font-semibold">Fiscalização, Instrução e Relatoria</td>
                    <td className="px-6 py-4 text-gray-600">Apoio operacional à fiscalização</td>
                </tr>
                <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">Papel na Chefia (FGG)</td>
                    <td className="px-6 py-4 bg-blue-50 text-primary-900 font-semibold">Coordenação e Supervisão (Natural)</td>
                    <td className="px-6 py-4 text-red-600 font-bold flex items-center gap-2"><AlertCircle size={14} /> Incompatibilidade Material</td>
                </tr>
            </tbody>
        </table>
    </div>
);
