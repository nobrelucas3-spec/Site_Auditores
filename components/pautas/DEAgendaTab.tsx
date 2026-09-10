import React, { useState, useEffect } from 'react';
import { DEMeeting } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { getGoogleCalendarUrl } from '../../services/calendarHelper';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    ChevronRight, 
    FileText, 
    Loader2, 
    ExternalLink, 
    Layers, 
    Sparkles 
} from 'lucide-react';

interface DEAgendaTabProps {
    onSelectPautaFromMeeting?: (pautaId: string) => void;
}

const GOOGLE_CALENDAR_ID = 'c_674ed67fb93843bbe1e85af50a888ac78c4b1ac23e35ecbe73ebadaaab0beca@group.calendar.google.com';
const GOOGLE_CALENDAR_EMBED_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=America%2FRecife&hl=pt_BR&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`;
const GOOGLE_CALENDAR_ADD_URL = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(GOOGLE_CALENDAR_ID)}`;

const DEAgendaTab: React.FC<DEAgendaTabProps> = ({ onSelectPautaFromMeeting }) => {
    const [viewMode, setViewMode] = useState<'google' | 'deliberations'>('google');
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const { data: meetingsData, error } = await supabase
                .from('de_meetings')
                .select(`
                    id,
                    title,
                    meeting_date,
                    meeting_time,
                    meeting_type,
                    location,
                    status,
                    general_deliberations,
                    created_at,
                    meeting_pautas (
                        id,
                        discussion_notes,
                        deliberation_result,
                        pautas (
                            id,
                            title,
                            category,
                            status,
                            score
                        )
                    )
                `)
                .order('meeting_date', { ascending: false });

            if (error) {
                console.error('Erro ao buscar reuniões:', error);
            } else if (meetingsData) {
                setMeetings(meetingsData);
            }
        } catch (err) {
            console.error('Erro inesperado:', err);
        } finally {
            setLoading(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const filteredMeetings = meetings.filter(m => {
        if (filter === 'upcoming') {
            return m.meeting_date >= todayStr && m.status !== 'cancelada';
        }
        if (filter === 'past') {
            return m.meeting_date < todayStr || m.status === 'realizada';
        }
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header com Seletor de Modo de Visualização */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="text-primary-600" size={22} />
                        Agenda Oficial da Diretoria Executiva
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Compromissos, audiências institucionais e atas de deliberações com a categoria.
                    </p>
                </div>

                {/* Alternador de Abas */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl shrink-0">
                    <button
                        onClick={() => setViewMode('google')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            viewMode === 'google'
                                ? 'bg-white text-primary-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Calendar size={16} />
                        Google Agenda
                    </button>

                    <button
                        onClick={() => setViewMode('deliberations')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            viewMode === 'deliberations'
                                ? 'bg-white text-primary-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FileText size={16} />
                        Deliberações de Pautas ({meetings.length})
                    </button>
                </div>
            </div>

            {/* MODO 1: GOOGLE CALENDAR EMBED */}
            {viewMode === 'google' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Barra de Aviso de Privacidade e Botão de Sincronização */}
                    <div className="bg-gradient-to-r from-primary-50 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-600 text-white p-2.5 rounded-xl shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-primary-950">
                                    Agenda Oficial Exclusiva da Associação
                                </h4>
                                <p className="text-xs text-primary-800/80 mt-0.5">
                                    Esta visualização exibe exclusivamente os compromissos públicos da Diretoria. As agendas pessoais dos diretores permanecem 100% privadas.
                                </p>
                            </div>
                        </div>

                        <a
                            href={GOOGLE_CALENDAR_ADD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 font-bold text-xs shrink-0 transition-colors shadow-xs"
                        >
                            <ExternalLink size={14} />
                            Adicionar ao Meu Google Agenda
                        </a>
                    </div>

                    {/* Google Calendar iFrame Container */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-4 shadow-sm overflow-hidden">
                        <iframe
                            src={GOOGLE_CALENDAR_EMBED_URL}
                            style={{ border: 0 }}
                            width="100%"
                            height="650"
                            frameBorder="0"
                            scrolling="no"
                            title="Google Agenda da Diretoria Executiva"
                            className="w-full rounded-xl"
                        />
                    </div>
                </div>
            )}

            {/* MODO 2: REUNIÕES DELIBERATIVAS DE PAUTAS */}
            {viewMode === 'deliberations' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Filtro de Status das Reuniões */}
                    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Filtrar Reuniões com Atas
                        </span>

                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    filter === 'all' 
                                        ? 'bg-white text-primary-700 shadow-xs' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    filter === 'upcoming' 
                                        ? 'bg-white text-primary-700 shadow-xs' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Próximas
                            </button>
                            <button
                                onClick={() => setFilter('past')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    filter === 'past' 
                                        ? 'bg-white text-primary-700 shadow-xs' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Realizadas
                            </button>
                        </div>
                    </div>

                    {/* Lista de Reuniões */}
                    {loading ? (
                        <div className="py-16 text-center text-slate-400">
                            <Loader2 className="animate-spin mx-auto mb-3 text-primary-600" size={32} />
                            <p className="text-sm font-medium">Carregando reuniões e deliberações...</p>
                        </div>
                    ) : filteredMeetings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
                            <Calendar size={48} className="mx-auto text-slate-300 mb-3" />
                            <h4 className="text-base font-bold text-slate-800">Nenhuma reunião encontrada</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                Não há reuniões registradas para o filtro selecionado. A Diretoria Executiva atualizará o mural assim que novas reuniões forem realizadas.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredMeetings.map((meeting) => (
                                <div 
                                    key={meeting.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Topo da Reunião */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                meeting.status === 'realizada' ? 'bg-emerald-100 text-emerald-800' :
                                                meeting.status === 'cancelada' ? 'bg-rose-100 text-rose-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {meeting.status === 'realizada' ? '✓ Realizada' :
                                                 meeting.status === 'cancelada' ? 'Cancelada' : 'Agendada'}
                                            </span>

                                            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
                                                {meeting.meeting_type}
                                            </span>

                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(meeting.meeting_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                            </span>

                                            {meeting.meeting_time && (
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={13} className="text-slate-400" />
                                                    {meeting.meeting_time}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            {meeting.location && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <MapPin size={13} className="text-slate-400" />
                                                    <span>{meeting.location}</span>
                                                </div>
                                            )}

                                            <a
                                                href={getGoogleCalendarUrl(meeting)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                                                title="Salvar esta reunião no meu Google Agenda com as pautas na descrição"
                                            >
                                                <Calendar size={12} />
                                                <span>+ Google Agenda</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Título da Reunião */}
                                    <h4 className="text-lg font-bold text-slate-900 mt-4 mb-2">
                                        {meeting.title}
                                    </h4>

                                    {/* Deliberações Gerais */}
                                    {meeting.general_deliberations && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
                                            <span className="font-bold text-slate-900 block mb-1">Síntese da Reunião & Encaminhamentos:</span>
                                            {meeting.general_deliberations}
                                        </div>
                                    )}

                                    {/* Pautas Vinculadas */}
                                    {meeting.meeting_pautas && meeting.meeting_pautas.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                                <FileText size={14} /> Pautas Tratadas nesta Reunião ({meeting.meeting_pautas.length})
                                            </h5>

                                            <div className="grid grid-cols-1 gap-3">
                                                {meeting.meeting_pautas.map((mp: any) => (
                                                    <div 
                                                        key={mp.id}
                                                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-primary-200 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-primary-700 uppercase bg-primary-100/60 px-2 py-0.5 rounded">
                                                                    {mp.pautas?.category}
                                                                </span>
                                                                <h6 className="font-bold text-sm text-slate-900 mt-1">
                                                                    {mp.pautas?.title}
                                                                </h6>
                                                            </div>

                                                            {onSelectPautaFromMeeting && mp.pautas?.id && (
                                                                <button
                                                                    onClick={() => onSelectPautaFromMeeting(mp.pautas.id)}
                                                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 shrink-0"
                                                                >
                                                                    Ver Pauta <ChevronRight size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Apontamentos e Deliberações */}
                                                        {mp.discussion_notes && (
                                                            <p className="text-xs text-slate-600 mt-2">
                                                                <strong>Apontamentos da discussão:</strong> {mp.discussion_notes}
                                                            </p>
                                                        )}

                                                        {mp.deliberation_result && (
                                                            <div className="mt-2 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs text-emerald-900 font-medium flex items-start gap-1.5">
                                                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                                                <span><strong>Decisão / Encaminhamento:</strong> {mp.deliberation_result}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DEAgendaTab;
