import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft, 
    FileText, 
    Loader2, 
    Info, 
    X,
    Filter
} from 'lucide-react';

interface DEAgendaTabProps {
    onSelectPautaFromMeeting?: (pautaId: string) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DEAgendaTab: React.FC<DEAgendaTabProps> = ({ onSelectPautaFromMeeting }) => {
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

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
                .order('meeting_date', { ascending: true });

            if (error) {
                console.error('Erro ao buscar reuniões:', error);
            } else if (meetingsData) {
                setMeetings(meetingsData);
            }
        } catch (err) {
            console.error('Erro inesperado ao buscar reuniões:', err);
        } finally {
            setLoading(false);
        }
    };

    // Data local de hoje (ex: '2026-09-18') no formato YYYY-MM-DD
    const localToday = new Date().toLocaleDateString('en-CA');

    // Mapeamento de reuniões por data (YYYY-MM-DD -> meetings[])
    const meetingsByDate = useMemo(() => {
        const map: Record<string, any[]> = {};
        meetings.forEach(m => {
            const d = m.meeting_date;
            if (!d) return;
            if (!map[d]) map[d] = [];
            map[d].push(m);
        });
        return map;
    }, [meetings]);

    // Categorização de reuniões
    const upcomingMeetings = useMemo(() => {
        return meetings
            .filter(m => m.status === 'agendada' || (m.meeting_date >= localToday && m.status !== 'cancelada' && m.status !== 'realizada'))
            .sort((a, b) => {
                const dateA = `${a.meeting_date}T${a.meeting_time || '00:00'}`;
                const dateB = `${b.meeting_date}T${b.meeting_time || '00:00'}`;
                return dateA.localeCompare(dateB); // Mais próxima primeiro
            });
    }, [meetings, localToday]);

    const pastMeetings = useMemo(() => {
        return meetings
            .filter(m => m.status === 'realizada' || (m.meeting_date < localToday && m.status !== 'agendada'))
            .sort((a, b) => {
                const dateA = `${a.meeting_date}T${a.meeting_time || '00:00'}`;
                const dateB = `${b.meeting_date}T${b.meeting_time || '00:00'}`;
                return dateB.localeCompare(dateA); // Mais recente primeiro
            });
    }, [meetings, localToday]);

    // Reuniões filtradas para exibição no painel direito
    const displayedMeetings = useMemo(() => {
        if (selectedDate) {
            return (meetingsByDate[selectedDate] || []).sort((a, b) => {
                const timeA = a.meeting_time || '00:00';
                const timeB = b.meeting_time || '00:00';
                return timeA.localeCompare(timeB);
            });
        }
        if (filter === 'upcoming') return upcomingMeetings;
        if (filter === 'past') return pastMeetings;
        return [...meetings].sort((a, b) => {
            const dateA = `${a.meeting_date}T${a.meeting_time || '00:00'}`;
            const dateB = `${b.meeting_date}T${b.meeting_time || '00:00'}`;
            return dateB.localeCompare(dateA);
        });
    }, [selectedDate, filter, meetingsByDate, upcomingMeetings, pastMeetings, meetings]);

    // Navegação do calendário mensal
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0 a 11

    const monthTitle = useMemo(() => {
        const title = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return title.charAt(0).toUpperCase() + title.slice(1);
    }, [currentMonth]);

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(localToday);
    };

    // Construção dos dias do calendário mensal
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

        // Dias finais do mês anterior
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const dateObj = new Date(year, month - 1, dayNum);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            days.push({ dayNum, dateStr, isCurrentMonth: false });
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            days.push({ dayNum: day, dateStr, isCurrentMonth: true });
        }

        // Dias iniciais do próximo mês para fechar a grade (múltiplo de 7)
        const totalSoFar = days.length;
        const remainder = (7 - (totalSoFar % 7)) % 7;
        for (let day = 1; day <= remainder; day++) {
            const dateObj = new Date(year, month + 1, day);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            days.push({ dayNum: day, dateStr, isCurrentMonth: false });
        }

        return days;
    }, [year, month]);

    const formatFriendlyDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const formatted = dateObj.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    return (
        <div className="space-y-6">
            {/* Header da Agenda */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="text-primary-600" size={22} />
                        Agenda Oficial da Diretoria Executiva
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Calendário oficial de reuniões ordinárias, extraordinárias e deliberações com a categoria.
                    </p>
                </div>

                {/* Resumo de Reuniões */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/70 px-4 py-2 rounded-xl text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        {upcomingMeetings.length} Agendada{upcomingMeetings.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        {pastMeetings.length} Realizada{pastMeetings.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Layout Integrado: Calendário Mensal (Esquerda) + Mural de Reuniões (Direita) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUNA ESQUERDA: CALENDÁRIO INTERATIVO NATIVO (5 colunas no desktop) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                    {/* Controles do Calendário */}
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-base text-slate-900">
                            {monthTitle}
                        </h4>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={goToToday}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Ir para o mês e dia atual"
                            >
                                Hoje
                            </button>
                            <button
                                onClick={goToPreviousMonth}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                title="Mês anterior"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={goToNextMonth}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                                title="Próximo mês"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Cabeçalho dos Dias da Semana */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-slate-400 pb-1 border-b border-slate-100">
                        {WEEKDAYS.map((wd) => (
                            <div key={wd} className="py-1">
                                {wd}
                            </div>
                        ))}
                    </div>

                    {/* Grade de Dias */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const dayMeetings = meetingsByDate[day.dateStr] || [];
                            const hasMeetings = dayMeetings.length > 0;
                            const isToday = day.dateStr === localToday;
                            const isSelected = selectedDate === day.dateStr;

                            // Verifica status das reuniões do dia
                            const hasUpcoming = dayMeetings.some(m => m.status === 'agendada');
                            const hasRealizada = dayMeetings.some(m => m.status === 'realizada');
                            const hasCancelada = dayMeetings.some(m => m.status === 'cancelada');

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedDate(null);
                                        } else {
                                            setSelectedDate(day.dateStr);
                                        }
                                    }}
                                    className={`relative min-h-[48px] sm:min-h-[52px] p-1.5 rounded-xl text-xs flex flex-col items-center justify-between transition-all group ${
                                        !day.isCurrentMonth
                                            ? 'text-slate-300 hover:text-slate-500'
                                            : isSelected
                                            ? 'bg-primary-600 text-white font-black shadow-md ring-2 ring-primary-300'
                                            : isToday
                                            ? 'bg-primary-50 text-primary-900 font-bold border border-primary-300'
                                            : hasMeetings
                                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                                        {day.dayNum}
                                    </span>

                                    {/* Indicadores de Reuniões */}
                                    {hasMeetings && (
                                        <div className="flex items-center gap-0.5 mt-1">
                                            {hasUpcoming && (
                                                <span 
                                                    className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`}
                                                    title="Reunião Agendada"
                                                />
                                            )}
                                            {hasRealizada && (
                                                <span 
                                                    className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`}
                                                    title="Reunião Realizada"
                                                />
                                            )}
                                            {hasCancelada && !hasUpcoming && !hasRealizada && (
                                                <span 
                                                    className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}
                                                    title="Reunião Cancelada"
                                                />
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legenda do Calendário */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Agendada</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>Realizada</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary-200 border border-primary-500"></span>
                            <span>Hoje</span>
                        </div>
                    </div>

                    {/* Dica de Uso */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                        <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>Clique em qualquer dia do calendário para filtrar as reuniões marcadas naquela data.</span>
                    </div>
                </div>

                {/* COLUNA DIREITA: MURAL DE REUNIÕES (7 colunas no desktop) */}
                <div className="lg:col-span-7 space-y-4">
                    
                    {/* Barra de Filtros e Status de Seleção */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {selectedDate ? (
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-primary-700">Data Selecionada</span>
                                    <h5 className="font-bold text-sm text-slate-900">
                                        {formatFriendlyDate(selectedDate)}
                                    </h5>
                                </div>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                                >
                                    <X size={14} />
                                    <span>Ver todas</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Filter size={13} className="text-slate-400" />
                                    Mural de Reuniões:
                                </span>

                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                                    <button
                                        onClick={() => setFilter('upcoming')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                            filter === 'upcoming'
                                                ? 'bg-white text-primary-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <Clock size={13} />
                                        <span>Próximas ({upcomingMeetings.length})</span>
                                    </button>

                                    <button
                                        onClick={() => setFilter('past')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                            filter === 'past'
                                                ? 'bg-white text-primary-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <CheckCircle2 size={13} />
                                        <span>Realizadas ({pastMeetings.length})</span>
                                    </button>

                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            filter === 'all'
                                                ? 'bg-white text-primary-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Todas ({meetings.length})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Lista de Reuniões */}
                    {loading ? (
                        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
                            <Loader2 className="animate-spin mx-auto mb-3 text-primary-600" size={32} />
                            <p className="text-sm font-medium">Carregando reuniões da Diretoria...</p>
                        </div>
                    ) : displayedMeetings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
                            <Calendar size={44} className="mx-auto text-slate-300" />
                            <h4 className="text-base font-bold text-slate-800">
                                {selectedDate 
                                    ? 'Nenhuma reunião cadastrada para este dia' 
                                    : filter === 'upcoming' 
                                    ? 'Nenhuma reunião agendada no momento'
                                    : filter === 'past'
                                    ? 'Nenhuma reunião realizada registrada'
                                    : 'Nenhuma reunião encontrada'}
                            </h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                {selectedDate 
                                    ? 'Selecione outra data no calendário ou clique em "Ver todas" para acompanhar o mural completo.'
                                    : filter === 'upcoming'
                                    ? 'A Diretoria Executiva publica com antecedência as próximas convocações e ordens do dia aqui.'
                                    : 'Assim que novas atas e deliberações forem concluídas, elas aparecerão aqui.'}
                            </p>

                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                                >
                                    Ver todas as reuniões
                                </button>
                            )}

                            {!selectedDate && filter === 'upcoming' && pastMeetings.length > 0 && (
                                <button
                                    onClick={() => setFilter('past')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                                >
                                    <FileText size={14} />
                                    Ver Reuniões Realizadas ({pastMeetings.length})
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedMeetings.map((meeting) => (
                                <div 
                                    key={meeting.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                                >
                                    {/* Topo do Card */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Badge de Status */}
                                            {meeting.status === 'realizada' ? (
                                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                                    Realizada
                                                </span>
                                            ) : meeting.status === 'cancelada' ? (
                                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                                    Cancelada
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                                    <Clock size={13} className="text-blue-600" />
                                                    Agendada
                                                </span>
                                            )}

                                            {/* Tipo da Reunião */}
                                            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                                                {meeting.meeting_type || 'Ordinária'}
                                            </span>

                                            {/* Data amigável */}
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatFriendlyDate(meeting.meeting_date)}
                                            </span>

                                            {/* Horário */}
                                            {meeting.meeting_time && (
                                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                    <Clock size={13} className="text-slate-400" />
                                                    {meeting.meeting_time}h
                                                </span>
                                            )}
                                        </div>

                                        {/* Localização */}
                                        {meeting.location && (
                                            <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                                                <MapPin size={13} className="text-slate-400" />
                                                <span>{meeting.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Título da Reunião */}
                                    <h4 className="text-lg font-bold text-slate-900 leading-snug">
                                        {meeting.title}
                                    </h4>

                                    {/* Deliberações Gerais / Síntese */}
                                    {meeting.general_deliberations && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                            <span className="font-bold text-slate-900 block mb-1">Síntese da Reunião & Encaminhamentos:</span>
                                            {meeting.general_deliberations}
                                        </div>
                                    )}

                                    {/* Pautas Vinculadas */}
                                    {meeting.meeting_pautas && meeting.meeting_pautas.length > 0 ? (
                                        <div className="pt-2 border-t border-slate-100 space-y-2.5">
                                            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                                <FileText size={13} /> Pautas Tratadas nesta Reunião ({meeting.meeting_pautas.length})
                                            </h5>

                                            <div className="grid grid-cols-1 gap-2.5">
                                                {meeting.meeting_pautas.map((mp: any) => (
                                                    <div 
                                                        key={mp.id}
                                                        className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-primary-200 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-primary-700 uppercase bg-primary-100/60 px-2 py-0.5 rounded">
                                                                    {mp.pautas?.category || 'Geral'}
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

                                                        {/* Apontamentos da Discussão */}
                                                        {mp.discussion_notes && (
                                                            <p className="text-xs text-slate-600 mt-2">
                                                                <strong>Apontamentos:</strong> {mp.discussion_notes}
                                                            </p>
                                                        )}

                                                        {/* Decisão / Encaminhamento */}
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
                                    ) : (
                                        <div className="text-xs text-slate-400 italic flex items-center gap-1.5">
                                            <Info size={13} />
                                            <span>Nenhuma pauta específica da categoria vinculada a esta reunião.</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DEAgendaTab;
