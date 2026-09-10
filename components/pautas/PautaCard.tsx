import React from 'react';
import { Pauta } from '../../types';
import { ThumbsUp, ThumbsDown, Star, ChevronRight, MessageSquare, ArrowRight, Clock } from 'lucide-react';

interface PautaCardProps {
    pauta: Pauta;
    rank?: number;
    currentUserId?: string;
    onOpenDetail: (pauta: Pauta) => void;
    onVote: (pautaId: string, type: 'support' | 'oppose' | null) => Promise<void>;
    votingLoading?: boolean;
}

const PautaCard: React.FC<PautaCardProps> = ({
    pauta,
    rank,
    currentUserId,
    onOpenDetail,
    onVote,
    votingLoading = false
}) => {
    const isAuthor = Boolean(currentUserId && pauta.created_by === currentUserId);
    const totalVotes = (pauta.support_count || 0) + (pauta.oppose_count || 0);
    const supportPercentage = totalVotes > 0 ? Math.round(((pauta.support_count || 0) / totalVotes) * 100) : 100;

    const getStatusBadge = () => {
        switch (pauta.status) {
            case 'priorizada_de':
                return <span className="inline-block bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">Prioridade DE</span>;
            case 'em_negociacao':
                return <span className="inline-block bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap">Em Negociação</span>;
            case 'em_analise_de':
                return <span className="inline-block bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap">Em Análise</span>;
            case 'atendida':
                return <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap">Atendida</span>;
            case 'unificada':
                return <span className="inline-block bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase whitespace-nowrap">Unificada</span>;
            default:
                return <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200/80 text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Aberta para Apoio</span>;
        }
    };

    return (
        <div 
            onClick={() => onOpenDetail(pauta)}
            className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer hover:shadow-lg relative group ${
                pauta.is_prioritized 
                    ? 'border-amber-300 shadow-amber-50/50 hover:border-amber-400 ring-1 ring-amber-200/50' 
                    : 'border-slate-200/80 hover:border-primary-300 shadow-sm'
            }`}
        >
            {/* Top Bar: Ranking, Categoria e Status */}
            <div>
                {/* Linha 1: Rank, Categoria e Status (Sempre alinhados horizontalmente sem quebra) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {rank !== undefined && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                                rank === 1 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                                rank === 2 ? 'bg-slate-200 text-slate-800' :
                                rank === 3 ? 'bg-amber-100 text-amber-900' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                #{rank}
                            </span>
                        )}
                        <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-md border border-primary-100 truncate">
                            {pauta.category}
                        </span>
                    </div>

                    <div className="shrink-0">
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Linha 2: Selos de Destaque da Diretoria e Autoria */}
                {(isAuthor || pauta.is_prioritized) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {pauta.is_prioritized && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs shrink-0">
                                <Star size={10} className="fill-white" /> Prioridade da Diretoria
                            </span>
                        )}
                        {isAuthor && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md shrink-0">
                                Sua Proposição
                            </span>
                        )}
                    </div>
                )}

                {/* Título da Pauta */}
                <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-primary-700 transition-colors mb-2 line-clamp-2 leading-snug">
                    {pauta.title}
                </h3>

                {/* Breve resumo da descrição */}
                <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {pauta.description}
                </p>

                {/* Consideração breve da DE (se houver) */}
                {pauta.de_considerations && (
                    <div className="bg-primary-50/60 border-l-2 border-primary-500 p-2.5 rounded-r-lg mb-3 text-xs text-primary-900 line-clamp-2 italic">
                        <span className="font-bold not-italic text-primary-950">Nota da Diretoria: </span>
                        {pauta.de_considerations}
                    </div>
                )}

                {/* Último Andamento Registrado (se houver) */}
                {pauta.current_progress && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80 mb-3">
                        <Clock size={12} className="shrink-0 text-amber-600" />
                        <span className="font-bold shrink-0">Andamento:</span>
                        <span className="truncate text-amber-950 font-medium">{pauta.current_progress}</span>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Placar, Voto Pessoal e Ações */}
            <div className="pt-4 border-t border-slate-100 mt-2">
                {/* Placar de Relevância */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <ThumbsUp size={14} className="text-emerald-600" />
                            <span>{pauta.support_count || 0}</span>
                            <span className="text-[10px] text-emerald-600 font-normal">apoios</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <ThumbsDown size={14} className="text-slate-400" />
                            <span>{pauta.oppose_count || 0}</span>
                            <span className="text-[10px] text-slate-500 font-normal">discordâncias</span>
                        </div>
                    </div>

                    {/* Saldo Líquido */}
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Saldo</span>
                        <span className={`text-base md:text-lg font-black ${
                            (pauta.score || 0) > 0 ? 'text-primary-700' :
                            (pauta.score || 0) < 0 ? 'text-red-600' : 'text-slate-600'
                        }`}>
                            {(pauta.score || 0) > 0 ? `+${pauta.score}` : pauta.score || 0}
                        </span>
                    </div>
                </div>

                {/* Barra Visual de Apoio vs Discordância */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                    <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${supportPercentage}%` }}
                    />
                </div>

                {/* Voto do Usuário e Botão de Ação */}
                <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Indicador do voto do usuário logado */}
                    <div>
                        {pauta.user_vote === 'support' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                                <ThumbsUp size={12} className="fill-emerald-700" /> Você apoia
                            </span>
                        ) : pauta.user_vote === 'oppose' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200">
                                <ThumbsDown size={12} className="fill-red-700" /> Você discorda
                            </span>
                        ) : (
                            <span className="text-[11px] text-slate-400 italic">
                                Você ainda não opinou
                            </span>
                        )}
                    </div>

                    <span className="text-xs font-bold text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
                        Ver detalhes <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PautaCard;
