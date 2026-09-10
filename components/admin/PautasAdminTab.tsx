import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Pauta, DEMeeting } from '../../types';
import { 
    Calendar, 
    ListFilter, 
    Star, 
    CheckCircle2, 
    Plus, 
    Edit, 
    Clock, 
    Layers, 
    FileText, 
    Loader2, 
    X, 
    AlertCircle, 
    Sparkles,
    ExternalLink 
} from 'lucide-react';
import { getGoogleCalendarUrl } from '../../services/calendarHelper';

const PautasAdminTab: React.FC = () => {
    const [subTab, setSubTab] = useState<'pautas' | 'meetings'>('pautas');
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modais e formulários
    const [selectedPauta, setSelectedPauta] = useState<Pauta | null>(null);
    const [isEditPautaOpen, setIsEditPautaOpen] = useState(false);
    const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
    const [isUnifyOpen, setIsUnifyOpen] = useState(false);
    const [targetPautaId, setTargetPautaId] = useState('');
    const [createdMeetingAlert, setCreatedMeetingAlert] = useState<{ title: string; url: string } | null>(null);

    // Form pauta edit
    const [editStatus, setEditStatus] = useState('aberta');
    const [editIsPrioritized, setEditIsPrioritized] = useState(false);
    const [editPriorityNote, setEditPriorityNote] = useState('');
    const [editConsiderations, setEditConsiderations] = useState('');
    const [editProgress, setEditProgress] = useState('');

    // Form timeline
    const [timelineTitle, setTimelineTitle] = useState('');
    const [timelineDesc, setTimelineDesc] = useState('');
    const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);

    // Form reunião
    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
    const [meetingTime, setMeetingTime] = useState('14:00');
    const [meetingType, setMeetingType] = useState('Ordinária');
    const [meetingLocation, setMeetingLocation] = useState('Sede da Associação / Online');
    const [selectedPautasForMeeting, setSelectedPautasForMeeting] = useState<string[]>([]);

    // Form resultado da reunião
    const [selectedMeetingForDeliberation, setSelectedMeetingForDeliberation] = useState<any>(null);
    const [meetingGeneralDelib, setMeetingGeneralDelib] = useState('');
    const [pautaDelibs, setPautaDelibs] = useState<Record<string, { notes: string; result: string }>>({});

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: pautasData } = await supabase
                .from('pautas')
                .select('*')
                .order('created_at', { ascending: false });

            if (pautasData) setPautas(pautasData);

            const { data: meetingsData } = await supabase
                .from('de_meetings')
                .select(`
                    *,
                    meeting_pautas (
                        id,
                        pauta_id,
                        discussion_notes,
                        deliberation_result,
                        pautas (id, title)
                    )
                `)
                .order('meeting_date', { ascending: false });

            if (meetingsData) setMeetings(meetingsData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditPauta = (p: Pauta) => {
        setSelectedPauta(p);
        setEditStatus(p.status);
        setEditIsPrioritized(p.is_prioritized);
        setEditPriorityNote(p.priority_note || '');
        setEditConsiderations(p.de_considerations || '');
        setEditProgress(p.current_progress || '');
        setIsEditPautaOpen(true);
    };

    const handleSavePautaEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPauta) return;
        setActionLoading(true);

        try {
            const { error } = await supabase
                .from('pautas')
                .update({
                    status: editStatus,
                    is_prioritized: editIsPrioritized,
                    priority_note: editPriorityNote || null,
                    de_considerations: editConsiderations || null,
                    current_progress: editProgress || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedPauta.id);

            if (error) throw error;

            setIsEditPautaOpen(false);
            await loadData();
        } catch (err: any) {
            alert('Erro ao salvar pauta: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddTimeline = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPauta) return;
        setActionLoading(true);

        try {
            const { error } = await supabase
                .from('pauta_updates')
                .insert({
                    pauta_id: selectedPauta.id,
                    title: timelineTitle,
                    description: timelineDesc,
                    event_date: timelineDate
                });

            if (error) throw error;

            setTimelineTitle('');
            setTimelineDesc('');
            setIsAddTimelineOpen(false);
            alert('Marco de andamento adicionado com sucesso!');
        } catch (err: any) {
            alert('Erro ao adicionar andamento: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnifyPautas = async () => {
        if (!selectedPauta || !targetPautaId) return;
        if (selectedPauta.id === targetPautaId) {
            alert('A pauta de destino deve ser diferente da pauta de origem.');
            return;
        }

        if (!confirm(`Deseja unificar esta pauta na pauta de destino? Os apoios serão migrados e esta pauta será marcada como "unificada".`)) {
            return;
        }

        setActionLoading(true);
        try {
            const { error } = await supabase.rpc('unify_pautas', {
                p_source_pauta_id: selectedPauta.id,
                p_target_pauta_id: targetPautaId
            });

            if (error) {
                // Fallback manual se a função RPC ainda não tiver sido criada
                await supabase
                    .from('pautas')
                    .update({ status: 'unificada', unified_into_pauta_id: targetPautaId })
                    .eq('id', selectedPauta.id);
            }

            setIsUnifyOpen(false);
            await loadData();
            alert('Pautas unificadas com sucesso!');
        } catch (err: any) {
            alert('Erro ao unificar pautas: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            // 1. Cria a reunião
            const { data: meetingData, error: mError } = await supabase
                .from('de_meetings')
                .insert({
                    title: meetingTitle,
                    meeting_date: meetingDate,
                    meeting_time: meetingTime,
                    meeting_type: meetingType,
                    location: meetingLocation,
                    status: 'agendada'
                })
                .select()
                .single();

            if (mError) throw mError;

            // 2. Vincula pautas selecionadas e atualiza o andamento em cada uma
            if (meetingData && selectedPautasForMeeting.length > 0) {
                const links = selectedPautasForMeeting.map(pId => ({
                    meeting_id: meetingData.id,
                    pauta_id: pId
                }));
                await supabase.from('meeting_pautas').insert(links);

                // Formata data amigável DD/MM/AAAA
                const [ano, mes, dia] = meetingDate.split('-');
                const formattedDate = `${dia}/${mes}/${ano}`;
                const progressNote = `Pautada na Reunião da Diretoria de ${formattedDate}`;

                for (const pId of selectedPautasForMeeting) {
                    await supabase
                        .from('pautas')
                        .update({ 
                            current_progress: progressNote,
                            updated_at: new Date().toISOString() 
                        })
                        .eq('id', pId);

                    await supabase
                        .from('pauta_updates')
                        .insert({
                            pauta_id: pId,
                            title: `Pautada em Reunião da Diretoria Executiva`,
                            description: `Pauta incluída na ordem do dia da Reunião (${meetingType}) agendada para ${formattedDate}.`,
                            event_date: meetingDate
                        });
                }
            }

            const gUrl = getGoogleCalendarUrl({
                title: meetingTitle,
                meeting_date: meetingDate,
                meeting_time: meetingTime,
                meeting_type: meetingType,
                location: meetingLocation,
                meeting_pautas: selectedPautasForMeeting.map(pId => ({
                    pautas: pautas.find(p => p.id === pId) || null
                }))
            });

            setIsNewMeetingOpen(false);
            const savedTitle = meetingTitle;
            setMeetingTitle('');
            setSelectedPautasForMeeting([]);
            await loadData();
            setCreatedMeetingAlert({ title: savedTitle, url: gUrl });
        } catch (err: any) {
            alert('Erro ao agendar reunião: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenDeliberation = (meeting: any) => {
        setSelectedMeetingForDeliberation(meeting);
        setMeetingGeneralDelib(meeting.general_deliberations || '');
        const delibs: Record<string, { notes: string; result: string }> = {};
        meeting.meeting_pautas?.forEach((mp: any) => {
            delibs[mp.id] = {
                notes: mp.discussion_notes || '',
                result: mp.deliberation_result || ''
            };
        });
        setPautaDelibs(delibs);
    };

    const handleAddPautaToMeeting = async (pautaId: string) => {
        if (!selectedMeetingForDeliberation || !pautaId) return;
        setActionLoading(true);
        try {
            const { data, error } = await supabase
                .from('meeting_pautas')
                .insert({
                    meeting_id: selectedMeetingForDeliberation.id,
                    pauta_id: pautaId
                })
                .select(`
                    id,
                    pauta_id,
                    discussion_notes,
                    deliberation_result,
                    pautas (id, title)
                `)
                .single();

            if (error) throw error;

            setSelectedMeetingForDeliberation((prev: any) => ({
                ...prev,
                meeting_pautas: [...(prev.meeting_pautas || []), data]
            }));

            setPautaDelibs(prev => ({
                ...prev,
                [data.id]: { notes: '', result: '' }
            }));

            await loadData();
        } catch (err: any) {
            alert('Erro ao vincular pauta: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveDeliberations = async () => {
        if (!selectedMeetingForDeliberation) return;
        setActionLoading(true);

        try {
            // 1. Salva ata geral e marca como realizada
            await supabase
                .from('de_meetings')
                .update({
                    general_deliberations: meetingGeneralDelib,
                    status: 'realizada',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedMeetingForDeliberation.id);

            // Formata data amigável DD/MM/AAAA
            const meetingDate = selectedMeetingForDeliberation.meeting_date || '';
            let formattedDate = meetingDate;
            if (meetingDate && meetingDate.includes('-')) {
                const [ano, mes, dia] = meetingDate.split('-');
                formattedDate = `${dia}/${mes}/${ano}`;
            }

            // 2. Salva apontamentos de cada pauta e propaga o andamento individual para o card
            for (const [mpId, val] of Object.entries(pautaDelibs)) {
                await supabase
                    .from('meeting_pautas')
                    .update({
                        discussion_notes: val.notes,
                        deliberation_result: val.result
                    })
                    .eq('id', mpId);

                // Localiza a pauta associada para atualizar seu andamento individual
                const mp = selectedMeetingForDeliberation.meeting_pautas?.find((item: any) => item.id === mpId);
                if (mp && mp.pauta_id) {
                    const resultText = val.result ? `: ${val.result}` : '';
                    const progressText = `Reunião DE (${formattedDate})${resultText}`;

                    await supabase
                        .from('pautas')
                        .update({ 
                            current_progress: progressText,
                            updated_at: new Date().toISOString() 
                        })
                        .eq('id', mp.pauta_id);

                    await supabase
                        .from('pauta_updates')
                        .insert({
                            pauta_id: mp.pauta_id,
                            title: `Deliberação em Reunião da Diretoria (${formattedDate})`,
                            description: val.result 
                                ? `Deliberação aprovada: ${val.result}${val.notes ? `\n\nApontamentos técnicos: ${val.notes}` : ''}`
                                : `Pauta apreciada e deliberada pela Diretoria Executiva na reunião do dia ${formattedDate}.${val.notes ? `\n\nApontamentos técnicos: ${val.notes}` : ''}`,
                            event_date: meetingDate || new Date().toISOString().split('T')[0]
                        });
                }
            }

            setSelectedMeetingForDeliberation(null);
            await loadData();
            alert('Deliberações registradas com sucesso! Os andamentos foram propagados para os cards de cada pauta tratada.');
        } catch (err: any) {
            alert('Erro ao salvar deliberações: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-16 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-primary-600" size={32} />
                <p className="text-xs">Carregando painel de pautas e reuniões...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Seletor de Sub-Abas */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSubTab('pautas')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            subTab === 'pautas' 
                                ? 'bg-primary-600 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <ListFilter size={14} /> Pautas da Categoria ({pautas.length})
                    </button>

                    <button
                        onClick={() => setSubTab('meetings')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            subTab === 'meetings' 
                                ? 'bg-primary-600 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Calendar size={14} /> Reuniões da Diretoria ({meetings.length})
                    </button>
                </div>

                {subTab === 'meetings' && (
                    <button
                        onClick={() => setIsNewMeetingOpen(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                        <Plus size={14} /> Agendar Nova Reunião
                    </button>
                )}
            </div>

            {/* TAB: GESTÃO DE PAUTAS */}
            {subTab === 'pautas' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Lista de Pautas Cadastradas
                        </span>
                        <span className="text-xs text-slate-500">
                            Total: {pautas.length} pautas
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                                    <th className="p-4">Título & Categoria</th>
                                    <th className="p-4 text-center">Apoios / Discordâncias</th>
                                    <th className="p-4 text-center">Saldo</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Prioridade DE</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {pautas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400">
                                            Nenhuma pauta cadastrada até o momento.
                                        </td>
                                    </tr>
                                ) : (
                                    pautas.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 max-w-sm">
                                                <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                                                <span className="text-[10px] text-primary-700 font-bold uppercase">{p.category}</span>
                                            </td>
                                            <td className="p-4 text-center font-medium">
                                                <span className="text-emerald-700 font-bold">+{p.support_count || 0}</span> / <span className="text-slate-500">-{p.oppose_count || 0}</span>
                                            </td>
                                            <td className="p-4 text-center font-black">
                                                <span className={(p.score || 0) > 0 ? 'text-primary-700' : 'text-slate-500'}>
                                                    {(p.score || 0) > 0 ? `+${p.score}` : p.score}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {p.is_prioritized ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase flex items-center gap-1 w-fit">
                                                        <Star size={10} className="fill-amber-600" /> Priorizada
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenEditPauta(p)}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Edit size={12} /> Gerenciar
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedPauta(p);
                                                        setIsAddTimelineOpen(true);
                                                    }}
                                                    className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Clock size={12} /> +Andamento
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedPauta(p);
                                                        setTargetPautaId('');
                                                        setIsUnifyOpen(true);
                                                    }}
                                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                    title="Unificar com outra pauta semelhante"
                                                >
                                                    <Layers size={12} /> Unificar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: GESTÃO DE REUNIÕES DA DE */}
            {subTab === 'meetings' && (
                <div className="space-y-4">
                    {meetings.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                            <Calendar size={40} className="mx-auto text-slate-300 mb-2" />
                            <h4 className="text-sm font-bold text-slate-700">Nenhuma reunião cadastrada</h4>
                            <p className="text-xs text-slate-400 mt-1">Clique em "Agendar Nova Reunião" para pautar itens e gerar eventos.</p>
                        </div>
                    ) : (
                        meetings.map((m) => (
                        <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800 uppercase">
                                            {m.meeting_type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            m.status === 'realizada' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-base text-slate-900">{m.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        {new Date(m.meeting_date + 'T00:00:00').toLocaleDateString('pt-BR')} às {m.meeting_time || '14:00'} • {m.location}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <a
                                        href={getGoogleCalendarUrl(m)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                        title="Abrir no Google Agenda com as pautas desta reunião já preenchidas"
                                    >
                                        <Calendar size={14} className="text-primary-600" />
                                        <span>Google Agenda</span>
                                        <ExternalLink size={12} className="text-slate-400" />
                                    </a>

                                    <button
                                        onClick={() => handleOpenDeliberation(m)}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                    >
                                        <FileText size={14} /> Registrar Deliberações & Ata
                                    </button>
                                </div>
                            </div>

                            {/* Pautas vinculadas */}
                            {m.meeting_pautas && m.meeting_pautas.length > 0 ? (
                                <div className="space-y-2 mt-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pautas em Pauta:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {m.meeting_pautas.map((mp: any) => (
                                            <span key={mp.id} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium">
                                                {mp.pautas?.title}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Nenhuma pauta associada diretamente.</p>
                            )}
                        </div>
                    )))}
                </div>
            )}

            {/* Modal de Edição de Pauta */}
            {isEditPautaOpen && selectedPauta && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900">Gerenciar Pauta (Diretoria Executiva)</h3>
                            <button onClick={() => setIsEditPautaOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSavePautaEdit} className="space-y-4 text-xs">
                            <div>
                                <p className="font-bold text-slate-800 text-sm mb-1">{selectedPauta.title}</p>
                                <p className="text-slate-500">{selectedPauta.category}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Status da Pauta</label>
                                    <select 
                                        value={editStatus} 
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full p-2.5 border rounded-xl bg-slate-50"
                                    >
                                        <option value="aberta">Aberta para Apoio</option>
                                        <option value="em_analise_de">Em Análise pela DE</option>
                                        <option value="priorizada_de">Priorizada pela DE</option>
                                        <option value="em_negociacao">Em Negociação</option>
                                        <option value="atendida">Atendida / Concluída</option>
                                        <option value="arquivada">Arquivada</option>
                                    </select>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer pt-4 font-bold text-amber-900">
                                        <input 
                                            type="checkbox" 
                                            checked={editIsPrioritized} 
                                            onChange={(e) => setEditIsPrioritized(e.target.checked)}
                                            className="w-4 h-4 text-amber-600 rounded"
                                        />
                                        Marcar como Prioridade da DE
                                    </label>
                                </div>
                            </div>

                            {editIsPrioritized && (
                                <div>
                                    <label className="block font-bold mb-1">Justificativa da Priorização</label>
                                    <input 
                                        type="text" 
                                        value={editPriorityNote}
                                        onChange={(e) => setEditPriorityNote(e.target.value)}
                                        placeholder="Ex: Impacto direto na simetria constitucional da carreira..."
                                        className="w-full p-2.5 border rounded-xl"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block font-bold mb-1">Resumo do Andamento Atual</label>
                                <input 
                                    type="text" 
                                    value={editProgress}
                                    onChange={(e) => setEditProgress(e.target.value)}
                                    placeholder="Ex: Ofício protocolado junto à Presidência do TCE-PE aguardando parecer."
                                    className="w-full p-2.5 border rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Considerações Oficiais da Diretoria Executiva</label>
                                <textarea 
                                    rows={4}
                                    value={editConsiderations}
                                    onChange={(e) => setEditConsiderations(e.target.value)}
                                    placeholder="Posicionamento técnico, viabilidade jurídica ou recomendações da diretoria..."
                                    className="w-full p-2.5 border rounded-xl resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button type="button" onClick={() => setIsEditPautaOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
                                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-primary-600 text-white rounded-xl font-bold">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Adicionar Andamento / Linha do Tempo */}
            {isAddTimelineOpen && selectedPauta && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-base text-slate-900">Novo Marco de Andamento</h3>
                            <button onClick={() => setIsAddTimelineOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAddTimeline} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Data do Evento</label>
                                <input 
                                    type="date"
                                    value={timelineDate}
                                    onChange={(e) => setTimelineDate(e.target.value)}
                                    className="w-full p-2 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Título do Andamento</label>
                                <input 
                                    type="text"
                                    required
                                    value={timelineTitle}
                                    onChange={(e) => setTimelineTitle(e.target.value)}
                                    placeholder="Ex: Reunião com a Presidência"
                                    className="w-full p-2 border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1">Descrição Detalhada</label>
                                <textarea 
                                    rows={3}
                                    required
                                    value={timelineDesc}
                                    onChange={(e) => setTimelineDesc(e.target.value)}
                                    placeholder="Descreva o que foi acordado ou realizado..."
                                    className="w-full p-2 border rounded-xl resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button type="button" onClick={() => setIsAddTimelineOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
                                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-primary-600 text-white rounded-xl font-bold">Adicionar Marco</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Unificar Pautas */}
            {isUnifyOpen && selectedPauta && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-xs">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-base text-slate-900">Unificar Pautas Similares</h3>
                            <button onClick={() => setIsUnifyOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            A pauta de origem <strong>"{selectedPauta.title}"</strong> terá seus apoios transferidos para a pauta principal de destino e será marcada com o status <em>Unificada</em>.
                        </p>
                        <div>
                            <label className="block font-bold mb-1">Selecione a Pauta Principal de Destino:</label>
                            <select 
                                value={targetPautaId} 
                                onChange={(e) => setTargetPautaId(e.target.value)}
                                className="w-full p-2.5 border rounded-xl bg-slate-50 font-medium"
                            >
                                <option value="">-- Escolha a pauta de destino --</option>
                                {pautas.filter(p => p.id !== selectedPauta.id && p.status !== 'unificada').map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} (+{p.score || 0} saldo)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button type="button" onClick={() => setIsUnifyOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
                            <button 
                                type="button" 
                                onClick={handleUnifyPautas} 
                                disabled={actionLoading || !targetPautaId} 
                                className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                Confirmar Unificação
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Agendar Reunião */}
            {isNewMeetingOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-xs">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-base text-slate-900">Agendar Reunião da Diretoria Executiva</h3>
                            <button onClick={() => setIsNewMeetingOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleCreateMeeting} className="space-y-3">
                            <div>
                                <label className="block font-bold mb-1">Título da Reunião *</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={meetingTitle}
                                    onChange={(e) => setMeetingTitle(e.target.value)}
                                    placeholder="Ex: 5ª Reunião Ordinária da Diretoria Executiva 2026"
                                    className="w-full p-2 border rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Data *</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="w-full p-2 border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Horário</label>
                                    <input 
                                        type="time" 
                                        value={meetingTime}
                                        onChange={(e) => setMeetingTime(e.target.value)}
                                        className="w-full p-2 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Tipo de Reunião</label>
                                    <select 
                                        value={meetingType}
                                        onChange={(e) => setMeetingType(e.target.value)}
                                        className="w-full p-2 border rounded-xl"
                                    >
                                        <option value="Ordinária">Ordinária</option>
                                        <option value="Extraordinária">Extraordinária</option>
                                        <option value="Reunião com Presidência TCE">Reunião com Presidência TCE</option>
                                        <option value="Audiência Externa">Audiência Externa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Local / Plataforma</label>
                                    <input 
                                        type="text" 
                                        value={meetingLocation}
                                        onChange={(e) => setMeetingLocation(e.target.value)}
                                        className="w-full p-2 border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Vincular Pautas a esta Reunião</label>
                                <div className="max-h-36 overflow-y-auto border rounded-xl p-2 space-y-1 bg-slate-50">
                                    {pautas.filter(p => p.status !== 'unificada' && p.status !== 'arquivada').map(p => (
                                        <label key={p.id} className="flex items-center gap-2 hover:bg-white p-1 rounded cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={selectedPautasForMeeting.includes(p.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPautasForMeeting(prev => [...prev, p.id]);
                                                    } else {
                                                        setSelectedPautasForMeeting(prev => prev.filter(id => id !== p.id));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <span className="truncate">{p.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button type="button" onClick={() => setIsNewMeetingOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
                                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-primary-600 text-white rounded-xl font-bold">Agendar Reunião</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Registro de Deliberações da Reunião */}
            {selectedMeetingForDeliberation && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Registrar Deliberações & Ata</h3>
                                <p className="text-slate-500">{selectedMeetingForDeliberation.title}</p>
                            </div>
                            <button onClick={() => setSelectedMeetingForDeliberation(null)}><X size={20} className="text-slate-400" /></button>
                        </div>

                        <div>
                            <label className="block font-bold mb-1">Síntese Geral / Ata da Reunião</label>
                            <textarea 
                                rows={4}
                                value={meetingGeneralDelib}
                                onChange={(e) => setMeetingGeneralDelib(e.target.value)}
                                placeholder="Resumo das discussões gerais, presentes e decisões institucionais tomadas..."
                                className="w-full p-2.5 border rounded-xl resize-none"
                            />
                        </div>

                        {/* Vincular pauta adicional a esta reunião */}
                        <div className="bg-primary-50/60 p-3 rounded-xl border border-primary-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            <span className="font-bold text-primary-950 text-xs">Incluir pauta nesta reunião:</span>
                            <select
                                onChange={async (e) => {
                                    if (e.target.value) {
                                        await handleAddPautaToMeeting(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="p-1.5 border border-primary-200 rounded-lg bg-white text-xs text-slate-800 outline-hidden font-medium"
                                defaultValue=""
                            >
                                <option value="" disabled>Selecionar pauta para incluir...</option>
                                {pautas
                                    .filter(p => p.status !== 'unificada' && p.status !== 'arquivada' && !selectedMeetingForDeliberation.meeting_pautas?.some((mp: any) => mp.pauta_id === p.id))
                                    .map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))
                                }
                            </select>
                        </div>

                        {selectedMeetingForDeliberation.meeting_pautas && selectedMeetingForDeliberation.meeting_pautas.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h4 className="font-bold text-slate-900 text-sm">Apontamentos para Pautas em Discussão:</h4>
                                {selectedMeetingForDeliberation.meeting_pautas.map((mp: any) => (
                                    <div key={mp.id} className="p-3 border rounded-xl bg-slate-50 space-y-2">
                                        <p className="font-bold text-slate-800">{mp.pautas?.title}</p>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Apontamentos / Discussão:</label>
                                            <input 
                                                type="text"
                                                value={pautaDelibs[mp.id]?.notes || ''}
                                                onChange={(e) => setPautaDelibs(prev => ({
                                                    ...prev,
                                                    [mp.id]: { ...(prev[mp.id] || { notes: '', result: '' }), notes: e.target.value }
                                                }))}
                                                placeholder="Notas técnicas sobre essa pauta..."
                                                className="w-full p-2 border rounded-lg bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-500 font-bold mb-0.5">Decisão / Encaminhamento Aprovado:</label>
                                            <input 
                                                type="text"
                                                value={pautaDelibs[mp.id]?.result || ''}
                                                onChange={(e) => setPautaDelibs(prev => ({
                                                    ...prev,
                                                    [mp.id]: { ...(prev[mp.id] || { notes: '', result: '' }), result: e.target.value }
                                                }))}
                                                placeholder="Ex: Aprovado encaminhamento de ofício conjunto."
                                                className="w-full p-2 border rounded-lg bg-white"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button type="button" onClick={() => setSelectedMeetingForDeliberation(null)} className="px-4 py-2 border rounded-xl font-bold">Cancelar</button>
                            <button 
                                type="button" 
                                onClick={handleSaveDeliberations}
                                disabled={actionLoading}
                                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                            >
                                Salvar Deliberações e Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso com 1-Clique para Google Agenda */}
            {createdMeetingAlert && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 size={28} />
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">Reunião Agendada com Sucesso!</h3>
                            <p className="text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">"{createdMeetingAlert.title}"</span> foi registrada no sistema.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                            <p className="font-semibold text-slate-800">Sincronização 1-Clique:</p>
                            <p>
                                Deseja abrir e salvar este compromisso diretamente no <strong>Google Agenda</strong> da Diretoria? As pautas selecionadas e a ordem do dia já irão preenchidas na descrição do evento.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setCreatedMeetingAlert(null)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                            >
                                Concluir sem Sincronizar
                            </button>
                            <a
                                href={createdMeetingAlert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setCreatedMeetingAlert(null)}
                                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                                <ExternalLink size={14} /> Salvar no Google Agenda
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PautasAdminTab;
