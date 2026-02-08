import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Printer, FileText } from 'lucide-react';
import { MOCK_AUDITS } from '../constants';
import ImageViewer from '../components/ImageViewer';

const Audit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<any>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState('');

    useEffect(() => {
        const foundAudit = MOCK_AUDITS.find(a => a.id === id);
        if (foundAudit) {
            setAudit(foundAudit);
        } else {
            navigate('/');
        }
    }, [id, navigate]);

    if (!audit) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <ImageViewer
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                imageSrc={currentImage}
                altText={audit.title}
            />

            {/* Header Image */}
            <div className="h-[40vh] relative w-full bg-slate-900">
                <img
                    src={audit.image}
                    alt={audit.title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white container mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                        <ArrowLeft size={16} /> Voltar para o Início
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-secondary-500 text-slate-900 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                            Auditoria {audit.status}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-300">
                            <Calendar size={14} /> {new Date(audit.date).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl shadow-sm">
                        {audit.title}
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10 flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="w-full md:w-3/4">
                    <div className="bg-white rounded-xl shadow-xl p-8 md:p-12">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-700 transition-colors text-sm font-medium">
                                    <Share2 size={18} /> Compartilhar
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-700 transition-colors text-sm font-medium">
                                    <Printer size={18} /> Imprimir
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-a:text-primary-700 hover:prose-a:text-primary-900 prose-img:rounded-xl">
                            <p className="lead text-xl text-gray-600 font-medium mb-8 border-l-4 border-secondary-500 pl-4 italic">
                                {audit.summary}
                            </p>

                            <div dangerouslySetInnerHTML={{ __html: audit.content || '' }} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-1/4 space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 border-b pb-2">Sobre esta Auditoria</h3>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <FileText className="text-secondary-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <span className="block font-bold text-slate-900">Status</span>
                                    {audit.status}
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Calendar className="text-secondary-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <span className="block font-bold text-slate-900">Data de Publicação</span>
                                    {new Date(audit.date).toLocaleDateString()}
                                </div>
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t">
                            <h4 className="font-bold text-slate-900 mb-2">Tem dúvidas?</h4>
                            <p className="text-xs text-gray-500 mb-4">Entre em contato com a nossa assessoria técnica.</p>
                            <Link to="/contato" className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center rounded-lg font-bold text-sm transition-colors">
                                Fale Conosco
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Audit;
