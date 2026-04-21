import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Save, 
    X, 
    TrendingUp, 
    Building2, 
    DollarSign,
    Loader2,
    Calendar,
    RefreshCw
} from 'lucide-react';

interface FixedInvestment {
    id: string;
    name: string;
    institution: string;
    amount: number;
    investment_type: string;
    last_updated_at: string;
}

const FinancesTab: React.FC = () => {
    const [investments, setInvestments] = useState<FixedInvestment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('CDB');

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('fixed_investments')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error('Erro ao buscar investimentos:', error);
        else setInvestments(data || []);
        setLoading(false);
    };

    const handleAdd = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase
            .from('fixed_investments')
            .insert([{
                name,
                institution,
                amount: parseFloat(amount) || 0,
                investment_type: type,
                updated_by: session?.user.email
            }]);

        if (error) {
            alert('Erro ao adicionar investimento: ' + error.message);
        } else {
            setIsAdding(false);
            resetForm();
            fetchInvestments();
        }
    };

    const handleUpdate = async (id: string, updatedAmount: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        const { error } = await supabase
            .from('fixed_investments')
            .update({ 
                amount: updatedAmount,
                last_updated_at: new Date().toISOString(),
                updated_by: session?.user.email
            })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar saldo: ' + error.message);
        } else {
            setEditingId(null);
            fetchInvestments();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este investimento do portfólio?')) return;

        const { error } = await supabase
            .from('fixed_investments')
            .delete()
            .eq('id', id);

        if (error) alert('Erro ao excluir: ' + error.message);
        else fetchInvestments();
    };

    const resetForm = () => {
        setName('');
        setInstitution('');
        setAmount('');
        setType('CDB');
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (loading && investments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 grayscale">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Carregando portfólio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Patrimônio Aplicado</p>
                        <h4 className="text-2xl font-black text-slate-900">
                            {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
                        </h4>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Instituições</p>
                        <h4 className="text-2xl font-black text-slate-900">
                            {new Set(investments.map(inv => inv.institution)).size}
                        </h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Atas de Atualização</p>
                        <h4 className="text-2xl font-black text-slate-900">{investments.length} Ativos</h4>
                    </div>
                </div>
            </div>

            {/* List & Controls */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Portfólio de Longo Prazo</h3>
                        <p className="text-sm text-gray-500">Gerencie CDBs, LCs e outras aplicações fixas.</p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        {isAdding ? <X size={18} /> : <Plus size={18} />}
                        {isAdding ? 'Cancelar' : 'Nova Aplicação'}
                    </button>
                </div>

                {isAdding && (
                    <div className="p-6 bg-primary-50/30 border-b border-primary-100 animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Ativo</label>
                                <input 
                                    type="text" value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Ex: CDB Pós-Fixado"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instituição</label>
                                <input 
                                    type="text" value={institution} onChange={e => setInstitution(e.target.value)}
                                    placeholder="Ex: Bradesco"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Atual (R$)</label>
                                <input 
                                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <button 
                                    onClick={handleAdd}
                                    className="w-full bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Confirmar Cadastro
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <th className="px-6 py-4">Investimento</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Saldo Atual</th>
                                <th className="px-6 py-4">Última Atualização</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {investments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{inv.name}</p>
                                                <p className="text-xs text-secondary-600 font-medium lowercase tracking-wide">{inv.institution}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                                            {inv.investment_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === inv.id ? (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    defaultValue={inv.amount}
                                                    onBlur={(e) => handleUpdate(inv.id, parseFloat(e.target.value))}
                                                    className="w-32 px-2 py-1 border rounded"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-lg">{formatCurrency(inv.amount)}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar size={14} />
                                            {new Date(inv.last_updated_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setEditingId(inv.id)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                title="Atualizar Saldo"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(inv.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remover Ativo"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {investments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Nenhum investimento fixo cadastrado no portfólio.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <DollarSign /> Nota do Tesoureiro
                    </h4>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                        Os saldos de CDB, LCI, LCA e outras aplicações fixas devem ser atualizados manualmente com base no extrato consolidado do banco. Estes valores serão somados ao Saldo em Caixa (Conta Corrente + InvestFácil) para compor o <strong>Patrimônio Total</strong> visível para os associados.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                    <TrendingUp size={300} />
                </div>
            </div>
        </div>
    );
};

export default FinancesTab;
