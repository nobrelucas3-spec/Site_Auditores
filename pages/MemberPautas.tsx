import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Pauta, PautaCategory } from '../types';
import { 
    ChevronLeft, 
    Search, 
    Filter, 
    Plus, 
    ThumbsUp, 
    ThumbsDown, 
    Star, 
    Calendar, 
    ListFilter, 
    Loader2, 
    Sparkles, 
    Clock, 
    CheckCircle2, 
    Info 
} from 'lucide-react';

import PautaCard from '../components/pautas/PautaCard';
import PautaDetailModal from '../components/pautas/PautaDetailModal';
import NewPautaModal from '../components/pautas/NewPautaModal';
import DEAgendaTab from '../components/pautas/DEAgendaTab';

const CATEGORIES: string[] = [
    'Todas as Categorias',
    'Carreira e Remuneração',
    'Condições de Trabalho',
    'Prerrogativas',
    'Saúde e Benefícios',
    'Tecnologia e Processos',
    'Institucional',
    'Outros'
];

const MemberPautas: React.FC = () => {
    const navigate = useNavigate();

    // Estado do usuário e sessão
    const [user, setUser] = useState<any>(null);
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Abas principais
    const [activeMainTab, setActiveMainTab] = useState<'pautas' | 'agenda'>('pautas');

    // Dados de pautas e votos do usuário logado
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [userVotes, setUserVotes] = useState<Record<string, 'support' | 'oppose'>>({});
    const [selectedPauta, setSelectedPauta] = useState<Pauta | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isNewPautaOpen, setIsNewPautaOpen] = useState(false);
    const [votingLoading, setVotingLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Filtros e busca
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
    const [sortFilter, setSortFilter] = useState<'ranking' | 'prioritized' | 'recent' | 'my_support' | 'my_oppose' | 'unvoted' | 'my_proposals'>('ranking');

    useEffect(() => {
        const checkAuthAndLoad = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/area-do-filiado');
                return;
            }

            setUser(session.user);

            // Validação do membro ativo
            const { data: memberData } = await supabase
                .from('members')
                .select('*')
                .ilike('email', session.user.email)
                .maybeSingle();

            if (!memberData || memberData.status !== 'active') {
                await supabase.auth.signOut();
                navigate('/area-do-filiado');
                return;
            }

            setMember(memberData);
            await loadPautasAndVotes(session.user.id);
            setLoading(false);
        };

        checkAuthAndLoad();
    }, [navigate]);

    // Carrega as pautas e os votos do usuário logado
    const loadPautasAndVotes = async (userId: string) => {
        try {
            // 1. Busca todas as pautas ativas (não unificadas/arquivadas na listagem principal)
            const { data: pautasData, error: pautasError } = await supabase
                .from('pautas')
                .select('*')
                .order('score', { ascending: false });

            if (pautasError) {
                console.error('Erro ao buscar pautas:', pautasError);
                return;
            }

            // 2. Busca os votos do usuário logado (garantia RLS: só retorna os votos do próprio usuário)
            const { data: votesData } = await supabase
                .from('pauta_votes')
                .select('pauta_id, vote_type')
                .eq('user_id', userId);

            const votesMap: Record<string, 'support' | 'oppose'> = {};
            if (votesData) {
                votesData.forEach((v: any) => {
                    votesMap[v.pauta_id] = v.vote_type;
                });
            }
            setUserVotes(votesMap);

            // 3. Mescla votos aos objetos de pauta
            const mergedPautas: Pauta[] = (pautasData || []).map((p: any) => ({
                ...p,
                user_vote: votesMap[p.id] || null
            }));

            setPautas(mergedPautas);

            // Atualiza pauta selecionada no modal se estiver aberta
            if (selectedPauta) {
                const updated = mergedPautas.find(p => p.id === selectedPauta.id);
                if (updated) setSelectedPauta(updated);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        }
    };

    // Votação ou remoção de voto com atualização otimista
    const handleVote = async (pautaId: string, voteType: 'support' | 'oppose' | null) => {
        if (!user) return;
        setVotingLoading(true);

        const currentVote = userVotes[pautaId] || null;

        // Atualização Otimista no estado local
        setPautas(prev => prev.map(p => {
            if (p.id !== pautaId) return p;

            let newSupport = p.support_count || 0;
            let newOppose = p.oppose_count || 0;

            // Remove o voto anterior
            if (currentVote === 'support') newSupport = Math.max(0, newSupport - 1);
            if (currentVote === 'oppose') newOppose = Math.max(0, newOppose - 1);

            // Adiciona o novo voto
            if (voteType === 'support') newSupport += 1;
            if (voteType === 'oppose') newOppose += 1;

            const updatedPauta: Pauta = {
                ...p,
                support_count: newSupport,
                oppose_count: newOppose,
                score: newSupport - newOppose,
                user_vote: voteType
            };

            if (selectedPauta && selectedPauta.id === pautaId) {
                setSelectedPauta(updatedPauta);
            }

            return updatedPauta;
        }));

        const newVotesMap = { ...userVotes };
        if (voteType) {
            newVotesMap[pautaId] = voteType;
        } else {
            delete newVotesMap[pautaId];
        }
        setUserVotes(newVotesMap);

        try {
            // Tenta via RPC function
            const { error: rpcError } = await supabase.rpc('cast_pauta_vote', {
                p_pauta_id: pautaId,
                p_vote_type: voteType
            });

            if (rpcError) {
                // Fallback manual para tabela direta caso RPC ainda não tenha sido executada
                if (!voteType) {
                    await supabase
                        .from('pauta_votes')
                        .delete()
                        .match({ pauta_id: pautaId, user_id: user.id });
                } else {
                    await supabase
                        .from('pauta_votes')
                        .upsert({
                            pauta_id: pautaId,
                            user_id: user.id,
                            vote_type: voteType
                        }, { onConflict: 'pauta_id,user_id' });
                }
                // Recarrega valores reais do servidor
                await loadPautasAndVotes(user.id);
            }
        } catch (err) {
            console.error('Erro na requisição de voto:', err);
            await loadPautasAndVotes(user.id);
        } finally {
            setVotingLoading(false);
        }
    };

    // Criação de nova pauta com 1º apoio automático
    const handleCreatePauta = async (title: string, category: string, description: string): Promise<boolean> => {
        if (!user) return false;
        setCreateLoading(true);

        try {
            // Tenta criar via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_pauta_with_initial_vote', {
                p_title: title,
                p_category: category,
                p_description: description
            });

            if (rpcError || !rpcData?.success) {
                // Fallback manual
                const { data: insertedPauta, error: insertError } = await supabase
                    .from('pautas')
                    .insert({
                        title,
                        category,
                        description,
                        status: 'aberta',
                        created_by: user.id,
                        support_count: 1,
                        oppose_count: 0,
                        score: 1
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                if (insertedPauta) {
                    await supabase
                        .from('pauta_votes')
                        .insert({
                            pauta_id: insertedPauta.id,
                            user_id: user.id,
                            vote_type: 'support'
                        });
                }
            }

            await loadPautasAndVotes(user.id);
            return true;
        } catch (err: any) {
            console.error('Erro ao criar pauta:', err);
            alert('Não foi possível cadastrar a pauta. Verifique sua conexão e tente novamente.');
            return false;
        } finally {
            setCreateLoading(false);
        }
    };

    // Filtros e ordenação da lista
    const filteredPautas = useMemo(() => {
        return pautas.filter(p => {
            // Esconder unificadas ou arquivadas na visualização padrão
            if (p.status === 'unificada' || p.status === 'arquivada') return false;

            // Busca textual
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchTitle = p.title.toLowerCase().includes(term);
                const matchDesc = p.description.toLowerCase().includes(term);
                if (!matchTitle && !matchDesc) return false;
            }

            // Filtro por categoria
            if (selectedCategory !== 'Todas as Categorias' && p.category !== selectedCategory) {
                return false;
            }

            // Filtro por posicionamento
            if (sortFilter === 'my_support' && p.user_vote !== 'support') return false;
            if (sortFilter === 'my_oppose' && p.user_vote !== 'oppose') return false;
            if (sortFilter === 'unvoted' && p.user_vote !== null) return false;
            if (sortFilter === 'prioritized' && !p.is_prioritized) return false;
            if (sortFilter === 'my_proposals' && p.created_by !== user?.id) return false;

            return true;
        }).sort((a, b) => {
            if (sortFilter === 'recent') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortFilter === 'prioritized') {
                if (a.is_prioritized && !b.is_prioritized) return -1;
                if (!a.is_prioritized && b.is_prioritized) return 1;
                return (b.score || 0) - (a.score || 0);
            }
            // Padrão: Ranking por Saldo Líquido decrescente
            return (b.score || 0) - (a.score || 0);
        });
    }, [pautas, searchTerm, selectedCategory, sortFilter]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-primary-600" size={36} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-16">
            {/* Header Superior */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/area-do-filiado/dashboard')}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 font-bold text-sm transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span>Voltar ao Painel</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-800 block">{member?.full_name}</span>
                            <span className="text-[10px] text-primary-600 font-bold uppercase">Associado TCE-PE</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                            {member?.full_name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                
                {/* Hero / Banner Informativo */}
                <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20"></div>
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-300 font-bold text-xs uppercase tracking-wider mb-3 border border-secondary-500/30">
                            <Sparkles size={12} /> Democracia e Participação Coletiva
                        </span>
                        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                            Pautas da Categoria & Agenda da Diretoria
                        </h1>
                        <p className="text-sm sm:text-base text-gray-200 font-light leading-relaxed mb-6">
                            Participe das decisões da Associação. Proponha novas demandas, apoie as pautas prioritárias com total sigilo de voto e acompanhe as reuniões da Diretoria Executiva.
                        </p>

                        {/* Abas de Navegação Principal */}
                        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl w-fit border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setActiveMainTab('pautas')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    activeMainTab === 'pautas' 
                                        ? 'bg-white text-primary-900 shadow-md' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <ListFilter size={16} />
                                Pautas da Categoria ({pautas.filter(p => p.status !== 'unificada' && p.status !== 'arquivada').length})
                            </button>

                            <button
                                onClick={() => setActiveMainTab('agenda')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                    activeMainTab === 'agenda' 
                                        ? 'bg-white text-primary-900 shadow-md' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Calendar size={16} />
                                Agenda da Diretoria Executiva
                            </button>
                        </div>
                    </div>
                </div>

                {/* ABA 1: PAUTAS DA CATEGORIA */}
                {activeMainTab === 'pautas' && (
                    <div className="space-y-6">
                        
                        {/* Barra de Controles: Busca, Categoria, Botão e Filtros Integrados */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
                            {/* Linha 1: Busca + Categoria + Propor Pauta */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                                    {/* Campo de Busca */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por palavras-chave na pauta..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-hidden bg-slate-50/50 focus:bg-white transition-all text-slate-800"
                                        />
                                    </div>

                                    {/* Seletor de Categoria */}
                                    <div className="relative shrink-0">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-hidden bg-slate-50/50 focus:bg-white transition-all text-slate-700"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Botão de Proposição */}
                                <button
                                    onClick={() => setIsNewPautaOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                                >
                                    <Plus size={18} />
                                    Propor Nova Pauta
                                </button>
                            </div>

                            {/* Linha 2: Filtros de Ordenação e Minha Participação */}
                            <div className="border-t border-slate-100 pt-3.5 flex flex-wrap items-center justify-between gap-3">
                                {/* Grupo: Visualização Geral */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Exibir:</span>
                                    <button
                                        onClick={() => setSortFilter('ranking')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'ranking'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>Mais Apoiadas</span>
                                    </button>

                                    <button
                                        onClick={() => setSortFilter('prioritized')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'prioritized'
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Star size={13} className={sortFilter === 'prioritized' ? 'fill-white' : 'text-amber-500'} />
                                        <span>Prioridades da Diretoria</span>
                                    </button>

                                    <button
                                        onClick={() => setSortFilter('recent')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'recent'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Clock size={13} />
                                        <span>Mais Recentes</span>
                                    </button>
                                </div>

                                {/* Grupo: Minha Participação */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Minha Participação:</span>
                                    <button
                                        onClick={() => setSortFilter('my_proposals')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'my_proposals'
                                                ? 'bg-primary-700 text-white shadow-xs'
                                                : 'bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100'
                                        }`}
                                    >
                                        <span>Minhas Proposições</span>
                                    </button>

                                    <button
                                        onClick={() => setSortFilter('my_support')}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'my_support'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <ThumbsUp size={12} />
                                        <span>Apoios</span>
                                    </button>

                                    <button
                                        onClick={() => setSortFilter('my_oppose')}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'my_oppose'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <ThumbsDown size={12} />
                                        <span>Discordâncias</span>
                                    </button>

                                    <button
                                        onClick={() => setSortFilter('unvoted')}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            sortFilter === 'unvoted'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>Não Avaliadas</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grid de Pautas */}
                        {filteredPautas.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
                                <Info size={48} className="mx-auto text-slate-300 mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">Nenhuma pauta encontrada</h3>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto mb-6">
                                    Não há propostas cadastradas com os filtros selecionados. Que tal ser o primeiro a propor uma nova pauta para a categoria?
                                </p>
                                <button
                                    onClick={() => setIsNewPautaOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-xs"
                                >
                                    <Plus size={18} />
                                    Propor Pauta Agora
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredPautas.map((pauta, idx) => (
                                    <PautaCard 
                                        key={pauta.id}
                                        pauta={pauta}
                                        rank={sortFilter === 'ranking' ? idx + 1 : undefined}
                                        currentUserId={user?.id}
                                        onOpenDetail={(p) => {
                                            setSelectedPauta(p);
                                            setIsDetailOpen(true);
                                        }}
                                        onVote={handleVote}
                                        votingLoading={votingLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ABA 2: AGENDA DA DIRETORIA EXECUTIVA */}
                {activeMainTab === 'agenda' && (
                    <DEAgendaTab 
                        onSelectPautaFromMeeting={(pautaId) => {
                            const found = pautas.find(p => p.id === pautaId);
                            if (found) {
                                setSelectedPauta(found);
                                setIsDetailOpen(true);
                            }
                        }}
                    />
                )}

            </main>

            {/* Modal de Detalhes da Pauta */}
            <PautaDetailModal 
                pauta={selectedPauta}
                isOpen={isDetailOpen}
                currentUserId={user?.id}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedPauta(null);
                }}
                onVote={handleVote}
                votingLoading={votingLoading}
            />

            {/* Modal de Proposição de Nova Pauta */}
            <NewPautaModal 
                isOpen={isNewPautaOpen}
                onClose={() => setIsNewPautaOpen(false)}
                existingPautas={pautas}
                onCreatePauta={handleCreatePauta}
                onVoteExisting={async (pId, vType) => {
                    await handleVote(pId, vType);
                }}
                loading={createLoading}
            />
        </div>
    );
};

export default MemberPautas;
