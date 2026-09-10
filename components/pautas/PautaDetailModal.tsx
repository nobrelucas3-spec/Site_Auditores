import React, { useState, useEffect } from 'react';
import { Pauta, PautaUpdate, MeetingPauta } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { 
    X, 
    ThumbsUp, 
    ThumbsDown, 
    Calendar, 
    Lock, 
    Clock, 
    FileText, 
    CheckCircle2, 
    Star, 
    Info, 
    AlertCircle, 
    RotateCcw,
    Loader2
} from 'lucide-react';

interface PautaDetailModalProps {
    pauta: Pauta | null;
    isOpen: boolean;
    currentUserId?: string;
    onClose: () => void;
    onVote: (pautaId: string, type: 'support' | 'oppose' | null) => Promise<void>;
    votingLoading: boolean;
}

const PautaDetailModal: React.FC<PautaDetailModalProps> = ({
    pauta,
    isOpen,
    currentUserId,
    onClose,
    onVote,
    votingLoading
}) => {
    const isAuthor = Boolean(currentUserId && pauta?.created_by === currentUserId);
    const [updates, setUpdates] = useState<PautaUpdate[]>([]);
    const [meetingPautas, setMeetingPautas] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (!pauta || !isOpen) return;

        const fetchDetails = async () => {
            setLoadingDetails(true);
            try {
                // Fetch updates / timeline
                const { data: updatesData } = await supabase
                    .from('pauta_updates')
                    .select('*')
                    .eq('pauta_id', pauta.id)
                    .order('event_date', { ascending: false });

                if (updatesData) setUpdates(updatesData);

                // Fetch linked meetings
                const { data: meetingsData } = await supabase
                    .from('meeting_pautas')
                    .select(`
                        id,
                        discussion_notes,
                        deliberation_result,
                        de_meetings (
                            id,
                            title,
                            meeting_date,
                            meeting_time,
                            meeting_type,
                            status
                        )
                    `)
                    .eq('pauta_id', pauta.id);

                if (meetingsData) setMeetingPautas(meetingsData);
            } catch (err) {
                console.error('Erro ao buscar detalhes da pauta:', err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [pauta, isOpen]);

    if (!isOpen || !pauta) return null;

    const totalVotes = (pauta.support_count || 0) + (pauta.oppose_count || 0);
    const supportPct = totalVotes > 0 ? Math.round(((pauta.support_count || 0) / totalVotes) * 100) : 100;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-primary-100 text-primary-800 rounded-md">
                                {pauta.category}
                            </span>
                            {pauta.is_prioritized && (
                                <span className="text-xs font-bold px-2.5 py-1 bg-amber-500 text-white rounded-md flex items-center gap-1 shadow-xs">
                                    <Star size={12} className="fill-white" /> Prioridade Estratégica da DE
                                </span>
                            )}
                            <span className="text-xs text-slate-400">
                                Proposta em {new Date(pauta.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {isAuthor && (
                                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md flex items-center gap-1">
                                    💡 Proposta por você (anônima para os demais associados)
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                            {pauta.title}
                        </h2>
                    </div>

                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* Placar e Painel de Voto Interativo */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                                    Manifestação da Categoria
                                </h4>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                                        <ThumbsUp size={16} className="text-emerald-600" /> {pauta.support_count || 0} apoios
                                    </span>
                                    <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                                        <ThumbsDown size={16} className="text-slate-400" /> {pauta.oppose_count || 0} discordâncias
                                    </span>
                                    <span className="text-sm font-bold text-primary-700 bg-primary-100/70 px-2.5 py-0.5 rounded-md">
                                        Saldo: {(pauta.score || 0) > 0 ? `+${pauta.score}` : pauta.score || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Botões de Posicionamento */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => onVote(pauta.id, pauta.user_vote === 'support' ? null : 'support')}
                                    disabled={votingLoading}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs ${
                                        pauta.user_vote === 'support'
                                            ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-500'
                                            : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                >
                                    <ThumbsUp size={16} className={pauta.user_vote === 'support' ? 'fill-white' : ''} />
                                    <span>{pauta.user_vote === 'support' ? 'Apoiada' : 'Apoiar'}</span>
                                </button>

                                <button
                                    onClick={() => onVote(pauta.id, pauta.user_vote === 'oppose' ? null : 'oppose')}
                                    disabled={votingLoading}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs ${
                                        pauta.user_vote === 'oppose'
                                            ? 'bg-rose-600 text-white shadow-rose-200 ring-2 ring-rose-500'
                                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    <ThumbsDown size={16} className={pauta.user_vote === 'oppose' ? 'fill-white' : ''} />
                                    <span>{pauta.user_vote === 'oppose' ? 'Discordada' : 'Discordar'}</span>
                                </button>

                                {pauta.user_vote && (
                                    <button
                                        onClick={() => onVote(pauta.id, null)}
                                        disabled={votingLoading}
                                        title="Remover minha manifestação"
                                        className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Barra de Proporção */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${supportPct}%` }}
                            />
                        </div>

                        {/* Aviso de Sigilo */}
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Lock size={13} className="text-primary-600 shrink-0" />
                            <strong>Sigilo Garantido:</strong> Seu voto é totalmente anônimo e confidencial. Nenhum associado tem acesso à sua manifestação.
                        </p>
                    </div>

                    {/* Explicação / Justificativa da Pauta */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600" />
                            Descrição e Justificativa da Proposta
                        </h3>
                        <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                            {pauta.description}
                        </div>
                    </div>

                    {/* Considerações Oficiais da Diretoria Executiva */}
                    {pauta.de_considerations && (
                        <div className="bg-primary-50/70 border border-primary-200 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-primary-950 mb-2 flex items-center gap-2">
                                <Info size={18} className="text-primary-600" />
                                Posicionamento Oficial da Diretoria Executiva
                            </h3>
                            <p className="text-xs md:text-sm text-primary-900 leading-relaxed whitespace-pre-line">
                                {pauta.de_considerations}
                            </p>
                            {pauta.priority_note && (
                                <p className="text-xs text-amber-800 font-medium mt-3 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                    <strong>Nota de Priorização:</strong> {pauta.priority_note}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Andamento Atual Resumido */}
                    {pauta.current_progress && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                                <Clock size={14} /> Andamento Atual
                            </h4>
                            <p className="text-xs md:text-sm text-amber-950 font-medium">
                                {pauta.current_progress}
                            </p>
                        </div>
                    )}

                    {/* Linha do Tempo de Andamentos (Timeline) */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Clock size={18} className="text-primary-600" />
                            Histórico de Ações e Andamento
                        </h3>

                        {loadingDetails ? (
                            <div className="py-6 text-center text-slate-400">
                                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                <span className="text-xs">Carregando histórico...</span>
                            </div>
                        ) : updates.length > 0 ? (
                            <div className="space-y-4 border-l-2 border-primary-200 ml-3 pl-4">
                                {updates.map((update) => (
                                    <div key={update.id} className="relative">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white ring-2 ring-primary-100"></div>
                                        <span className="text-[11px] font-bold text-primary-700 block">
                                            {new Date(update.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                        </span>
                                        <h5 className="font-bold text-sm text-slate-800 mt-0.5">
                                            {update.title}
                                        </h5>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                                            {update.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 italic text-center">
                                Nenhum marco adicional registrado até o momento.
                            </div>
                        )}
                    </div>

                    {/* Reuniões da Diretoria Executiva em que a pauta foi tratada */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Calendar size={18} className="text-primary-600" />
                            Reuniões da Diretoria Executiva Relacionadas
                        </h3>

                        {meetingPautas.length > 0 ? (
                            <div className="space-y-3">
                                {meetingPautas.map((item) => (
                                    <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="font-bold text-xs text-slate-900">
                                                {item.de_meetings?.title}
                                            </span>
                                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                                                {item.de_meetings?.meeting_date ? new Date(item.de_meetings.meeting_date + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                                            </span>
                                        </div>
                                        {item.discussion_notes && (
                                            <p className="text-xs text-slate-600 mb-2">
                                                <strong>Apontamentos:</strong> {item.discussion_notes}
                                            </p>
                                        )}
                                        {item.deliberation_result && (
                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-emerald-800">
                                                <strong>Resultado / Encaminhamento:</strong> {item.deliberation_result}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 italic text-center">
                                Esta pauta ainda não foi objeto de deliberação em reunião registrada da Diretoria.
                            </div>
                        )}
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PautaDetailModal;
