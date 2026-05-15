import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Bell, 
  Calendar, 
  ArrowLeft, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  ChevronRight,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '../constants';
import { Announcement, AnnouncementSeverity } from '../types/announcement';
import Modal from '../components/Modal';

const MemberAnnouncements: React.FC = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    // Load read announcements from localStorage
    const saved = localStorage.getItem('read_announcements');
    if (saved) {
      setReadIds(JSON.parse(saved));
    }
    setAnnouncements(MOCK_ANNOUNCEMENTS);
  }, []);

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      setReadIds(newReadIds);
      localStorage.setItem('read_announcements', JSON.stringify(newReadIds));
    }
  };

  const handleOpenAnnouncement = (ann: Announcement) => {
    setSelectedAnn(ann);
    markAsRead(ann.id);
  };

  const getSeverityStyles = (severity: AnnouncementSeverity) => {
    switch (severity) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <AlertTriangle className="text-red-500" size={20} />,
          badge: 'bg-red-100 text-red-700'
        };
      case 'important':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle className="text-amber-500" size={20} />,
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="text-blue-500" size={20} />,
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Informativos aos Associados - Área do Filiado</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/area-do-filiado/dashboard" className="text-gray-400 hover:text-primary-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                <Bell size={18} />
              </div>
              <h1 className="font-bold text-slate-800 text-lg">Informativos</h1>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            Exclusivo para Associados
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Megaphone size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Comunicados Oficiais</h2>
            <p className="text-primary-100 max-w-xl">
              Fique por dentro das últimas decisões, assembleias e notícias internas da nossa associação.
            </p>
          </div>
        </div>

        {/* Filter/Status Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">
              Mostrando {announcements.length} comunicados
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <CheckCircle2 size={14} className="text-green-500" />
            {readIds.length} Lidos
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isRead = readIds.includes(ann.id);
            const styles = getSeverityStyles(ann.severity);
            
            return (
              <div 
                key={ann.id}
                onClick={() => handleOpenAnnouncement(ann)}
                className={`
                  relative bg-white border rounded-xl p-5 cursor-pointer transition-all duration-200 group
                  ${isRead ? 'border-gray-200 opacity-80' : 'border-primary-200 shadow-md ring-1 ring-primary-50'}
                  hover:shadow-lg hover:-translate-y-0.5
                `}
              >
                {!isRead && (
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                )}

                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl shrink-0 h-fit ${styles.bg}`}>
                    {styles.icon}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                        {ann.category}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <Calendar size={12} />
                        {new Date(ann.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <h3 className={`text-lg font-bold mb-2 group-hover:text-primary-700 transition-colors ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {ann.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {ann.summary}
                    </p>
                  </div>

                  <div className="flex items-center text-gray-300 group-hover:text-primary-600 transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            );
          })}

          {announcements.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Bell className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">Nenhum informativo no momento.</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedAnn && (
        <Modal
          isOpen={!!selectedAnn}
          onClose={() => setSelectedAnn(null)}
          title={selectedAnn.title}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-primary-600" />
                {new Date(selectedAnn.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-primary-600" />
                {selectedAnn.category}
              </div>
            </div>

            <div 
              className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selectedAnn.content }}
            />

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAnn(null)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-md active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MemberAnnouncements;
