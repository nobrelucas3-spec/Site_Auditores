import React, { useState, useMemo } from 'react';
import { Pauta, PautaCategory } from '../../types';
import { X, Lightbulb, ThumbsUp, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface NewPautaModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingPautas: Pauta[];
    onCreatePauta: (title: string, category: string, description: string) => Promise<boolean>;
    onVoteExisting: (pautaId: string, type: 'support') => Promise<void>;
    loading: boolean;
}

const CATEGORIES: PautaCategory[] = [
    'Carreira e Remuneração',
    'Condições de Trabalho',
    'Prerrogativas',
    'Saúde e Benefícios',
    'Tecnologia e Processos',
    'Institucional',
    'Outros'
];

const NewPautaModal: React.FC<NewPautaModalProps> = ({
    isOpen,
    onClose,
    existingPautas,
    onCreatePauta,
    onVoteExisting,
    loading
}) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<string>(CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [dismissedSuggestions, setDismissedSuggestions] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Detector inteligente de pautas semelhantes baseado em palavras inteiras e relevância
    const similarPautas = useMemo(() => {
        if (!title.trim() || title.trim().length < 5 || dismissedSuggestions) {
            return [];
        }

        const normalize = (str: string) => 
            str.toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")
               .replace(/[^\w\s]/g, " ");

        // Stopwords e termos genéricos que não devem causar falso positivo
        const STOPWORDS = new Set([
            'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 
            'por', 'para', 'com', 'sem', 'sob', 'sobre', 'como', 'mais', 'menos',
            'que', 'qual', 'quais', 'pelo', 'pela', 'pelos', 'pelas', 'uma', 'um',
            'uns', 'umas', 'tce', 'tcepe', 'tce-pe', 'auditor', 'auditores', 
            'tribunal', 'associacao', 'proposta', 'pauta', 'pedido', 'solicitacao',
            'criacao', 'alteracao', 'melhoria', 'novo', 'nova', 'novos', 'novas',
            'geral', 'sobre', 'referente', 'quanto'
        ]);

        // Função para normalizar plurais simples em português (ex: convenios -> convenio)
        const stemWord = (w: string) => {
            if (w.length > 5 && w.endsWith('s')) return w.slice(0, -1);
            return w;
        };

        const searchWords = normalize(title)
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length >= 3 && !STOPWORDS.has(w))
            .map(stemWord);

        if (searchWords.length === 0) return [];

        // Pontua cada pauta existente
        const scored = existingPautas
            .filter(p => p.status !== 'arquivada' && p.status !== 'unificada')
            .map(p => {
                const titleTokens = normalize(p.title)
                    .split(/\s+/)
                    .map(w => w.trim())
                    .filter(w => w.length >= 3 && !STOPWORDS.has(w))
                    .map(stemWord);

                const descTokens = normalize(p.description)
                    .split(/\s+/)
                    .map(w => w.trim())
                    .filter(w => w.length >= 3 && !STOPWORDS.has(w))
                    .map(stemWord);

                const titleSet = new Set(titleTokens);
                const descSet = new Set(descTokens);

                // Conta correspondência exata de palavras inteiras
                let score = 0;
                searchWords.forEach(w => {
                    if (titleSet.has(w)) {
                        score += 3; // Correspondência no título tem peso 3
                    } else if (descSet.has(w)) {
                        score += 1; // Correspondência na descrição tem peso 1
                    }
                });

                // Proporção de palavras do usuário encontradas
                const matchedWordsCount = searchWords.filter(w => titleSet.has(w) || descSet.has(w)).length;
                const coverage = matchedWordsCount / searchWords.length;

                return {
                    pauta: p,
                    score,
                    coverage,
                    matchedWordsCount
                };
            })
            // Critério inteligente:
            // - Se o usuário digitou apenas 1 palavra significativa, exige que ela esteja no título da pauta existente
            // - Se digitou 2 ou mais palavras, exige pelo menos 2 pontos (ex: 1 no título ou 2 na descrição) e cobertura mínima
            .filter(item => {
                if (searchWords.length === 1) {
                    return item.score >= 3; // Palavra idêntica no título
                }
                return item.score >= 3 || (item.matchedWordsCount >= 2 && item.coverage >= 0.4);
            })
            .sort((a, b) => b.score - a.score);

        return scored.slice(0, 3).map(item => item.pauta);
    }, [title, existingPautas, dismissedSuggestions]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (title.trim().length < 8) {
            setErrorMsg('Por favor, informe um título descritivo com pelo menos 8 caracteres.');
            return;
        }

        if (description.trim().length < 20) {
            setErrorMsg('A justificativa da pauta deve ter pelo menos 20 caracteres para que os associados possam compreendê-la.');
            return;
        }

        const success = await onCreatePauta(title.trim(), category, description.trim());
        if (success) {
            setTitle('');
            setDescription('');
            setCategory(CATEGORIES[0]);
            setDismissedSuggestions(false);
            onClose();
        }
    };

    const handleSupportExisting = async (pauta: Pauta) => {
        await onVoteExisting(pauta.id, 'support');
        setTitle('');
        setDescription('');
        setDismissedSuggestions(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-100 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 text-white p-2.5 rounded-xl">
                            <Lightbulb size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Propor Nova Pauta</h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Proposição coletiva anônima para a categoria
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Título da Pauta */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Título da Pauta *
                        </label>
                        <input 
                            type="text"
                            required
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setDismissedSuggestions(false);
                            }}
                            placeholder="Ex: Regulamentação do teletrabalho com compensação tecnológica"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-hidden text-sm transition-all bg-slate-50/50 focus:bg-white text-slate-800 font-medium"
                        />
                    </div>

                    {/* Alerta Inteligente Anti-Duplicação */}
                    {similarPautas.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-fade-in space-y-3">
                            <div className="flex items-start gap-2.5">
                                <div className="bg-amber-500 text-white p-1 rounded-lg shrink-0 mt-0.5">
                                    <Lightbulb size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                                        Identificamos pautas parecidas já em andamento:
                                    </h4>
                                    <p className="text-xs text-amber-800 mt-0.5">
                                        Para fortalecer as reivindicações sem fragmentar o número de apoios, que tal apoiar uma pauta existente?
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                {similarPautas.map(sp => (
                                    <div key={sp.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">{sp.title}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {sp.category} • <strong className="text-emerald-600">{sp.support_count || 0} apoios</strong> (Saldo: +{sp.score || 0})
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleSupportExisting(sp)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                                        >
                                            <ThumbsUp size={12} /> Apoiar Esta
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="text-right pt-1">
                                <button
                                    type="button"
                                    onClick={() => setDismissedSuggestions(true)}
                                    className="text-[11px] text-amber-800 font-bold hover:underline"
                                >
                                    Minha proposta é diferente, continuar cadastrando →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Categoria */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Categoria Temática *
                        </label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-hidden text-sm transition-all bg-slate-50/50 focus:bg-white text-slate-800 font-medium"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Descrição e Justificativa */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Justificativa e Detalhamento da Proposta *
                        </label>
                        <textarea 
                            rows={4}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o contexto, os motivos da reivindicação e o benefício esperado para os auditores e para a carreira..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-hidden text-sm transition-all bg-slate-50/50 focus:bg-white text-slate-800 font-medium resize-none leading-relaxed"
                        />
                    </div>

                    {/* Aviso de Privacidade & Apoio Inicial */}
                    <div className="bg-primary-50/60 p-3.5 rounded-xl border border-primary-100 flex items-center gap-3">
                        <Lock size={18} className="text-primary-600 shrink-0" />
                        <p className="text-xs text-primary-900 leading-snug">
                            <strong>Publicação Anônima:</strong> Seu nome não aparecerá para outros associados. No momento da criação, <strong>seu 1º apoio será computado automaticamente</strong> e a pauta nascerá com saldo +1.
                        </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Cadastrar Pauta
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPautaModal;
