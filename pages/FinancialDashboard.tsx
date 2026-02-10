import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, TrendingDown, DollarSign, PieChart, Lock, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import useInactivityTimer from '../hooks/useInactivityTimer';

interface FinancialRecord {
    id: string;
    transaction_date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    status: 'paid' | 'pending';
    entity: string;
}

const FinancialDashboard: React.FC = () => {
    const navigate = useNavigate();
    useInactivityTimer(15);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isActiveMember, setIsActiveMember] = useState(true); // Can be refined with DB check
    const [records, setRecords] = useState<FinancialRecord[]>([]);

    // Metrics
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/area-do-filiado');
                return;
            }
            setUser(session.user);

            // 2. Calculate Accumulated Balance from Previous Years (2024 to CurrentYear - 1)
            const currentYear = new Date().getFullYear();
            const startYear = 2026;
            let previousYearsBalance = 0;

            for (let y = startYear; y < currentYear; y++) {
                const { data: yearData } = await supabase
                    .from(`finances_${y}` as any)
                    .select('amount, type, status');

                if (yearData) {
                    const yearIncome = yearData
                        .filter((r: any) => r.type === 'income' && r.status === 'paid')
                        .reduce((acc: number, r: any) => acc + Number(r.amount), 0);
                    const yearExpense = yearData
                        .filter((r: any) => r.type === 'expense' && r.status === 'paid')
                        .reduce((acc: number, r: any) => acc + Number(r.amount), 0);
                    previousYearsBalance += (yearIncome - yearExpense);
                }
            }

            // 3. Fetch Current Year Records
            const tableName = `finances_${currentYear}`;
            console.log(`Fetching current records from: ${tableName}`);

            const { data, error } = await supabase
                .from(tableName as any)
                .select('*')
                .order('transaction_date', { ascending: false });

            if (error) {
                console.error(`Error fetching records from ${tableName}:`, error);
                // If current year table doesn't exist or error, we still show previous balance
                setRecords([]);
                calculateMetrics([], previousYearsBalance);
            } else if (data) {
                setRecords(data as FinancialRecord[]);
                calculateMetrics(data as FinancialRecord[], previousYearsBalance);
            }

            setLoading(false);
        };

        fetchData();
    }, [navigate]);

    const calculateMetrics = (data: FinancialRecord[], initialBalance: number = 0) => {
        let revenue = 0;
        let expenses = 0;
        let otherIncome = 0; // Income that is not strictly 'Receita' (e.g., 'Saldo')

        data.forEach(item => {
            if (item.status === 'paid') {
                const val = Math.abs(Number(item.amount));

                if (item.type === 'income') {
                    // Strict filter: only 'Receita' category counts as Operating Revenue
                    // Everything else (like 'Saldo') enters the balance but not the Revenue Card
                    if (item.category === 'Receita') {
                        revenue += val;
                    } else {
                        otherIncome += val;
                    }
                }
                if (item.type === 'expense') expenses += val;
            }
        });

        setTotalRevenue(revenue);
        setTotalExpenses(expenses);
        // Balance includes EVERYTHING: Initial + Other(Saldo) + Revenue - Expenses
        setBalance(initialBalance + otherIncome + revenue - expenses);
    };

    // Helper functions for charts/tables
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
    };

    // --- Chart Data Preparation (Simple aggregation) ---
    // 1. Expense by Category
    const expensesByCategory = records
        .filter(r => r.type === 'expense' && r.status === 'paid')
        .reduce((acc, curr) => {
            const amount = Number(curr.amount);
            const currentTotal = acc[curr.category] || 0;
            acc[curr.category] = currentTotal + amount;
            return acc;
        }, {} as Record<string, number>);

    const sortedCategories = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5); // Top 5 categories

    // Calculate percentages
    const totalCalcExpenses = Object.values(expensesByCategory).reduce((a, b) => (a as number) + (b as number), 0);

    // 2. Monthly Evolution (simplified for current year/last 6 months)
    interface MonthlyData {
        income: number;
        expense: number;
        sortDate: number;
    }

    // Group by Month-Year
    const monthlyData = records.reduce((acc, curr) => {
        if (curr.status !== 'paid') return acc;
        const [y, m, d] = curr.transaction_date.split('-');
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        const key = `${date.toLocaleString('default', { month: 'short' })}/${y}`; // e.g., "Fev/2026"

        if (!acc[key]) acc[key] = { income: 0, expense: 0, sortDate: date.getTime() };

        if (curr.type === 'income') {
            // STRICT RULE: Only 'Receita' counts for the Monthly Chart
            if (curr.category === 'Receita') {
                acc[key].income += Number(curr.amount);
            }
        }

        if (curr.type === 'expense') acc[key].expense += Number(curr.amount);

        return acc;
    }, {} as Record<string, MonthlyData>);

    const sortedMonths = Object.entries(monthlyData)
        .sort(([, a], [, b]) => (a as MonthlyData).sortDate - (b as MonthlyData).sortDate)
        .slice(-6); // Last 6 months

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    if (!isActiveMember) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Restrito</h2>
                    <p className="text-gray-600 mb-6">Esta área é exclusiva para associados com status <strong>Ativo</strong>.</p>
                    <button onClick={() => navigate('/area-do-filiado/dashboard')} className="text-primary-600 font-bold hover:underline">
                        Voltar para o Painel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/area-do-filiado/dashboard')} className="text-gray-400 hover:text-primary-600 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="font-bold text-slate-800 text-lg">Prestação de Contas {new Date().getFullYear()}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="hidden sm:inline">Logado como:</span>
                        <strong className="text-gray-900">{user?.email}</strong>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">

                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Revenue */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receita Realizada</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalRevenue)}</h3>
                            </div>
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Total acumulado</p>
                    </div>

                    {/* Expenses */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Despesas Pagas</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalExpenses)}</h3>
                            </div>
                            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                <TrendingDown size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Total acumulado</p>
                    </div>

                    {/* Balance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo em Caixa</p>
                                <h3 className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(balance)}
                                </h3>
                            </div>
                            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 font-bold">Disponível</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Monthly Evolution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" /> Fluxo Mensal
                        </h3>
                        {sortedMonths.length > 0 ? (
                            <div className="h-64 flex items-end justify-between gap-2 px-2">
                                {sortedMonths.map(([key, data]) => {
                                    // Scale bars relative to max value
                                    const maxVal = Math.max(...sortedMonths.flatMap((entry: [string, MonthlyData]) => {
                                        const d = entry[1];
                                        return [d.income, d.expense];
                                    }));

                                    const incHeight = maxVal > 0 ? (data.income / maxVal) * 100 : 0;
                                    const expHeight = maxVal > 0 ? (data.expense / maxVal) * 100 : 0;

                                    return (
                                        <div key={key} className="flex flex-col items-center gap-1 w-full h-full justify-end">
                                            <div className="flex items-end gap-1 h-full w-full justify-center">
                                                <div style={{ height: `${incHeight}%` }} className="w-4 bg-green-500 rounded-t opacity-90" title={`Receita: ${formatCurrency(data.income)}`}></div>
                                                <div style={{ height: `${expHeight}%` }} className="w-4 bg-red-400 rounded-t opacity-90" title={`Despesa: ${formatCurrency(data.expense)}`}></div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{key.split('/')[0]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">Sem dados suficientes</div>
                        )}
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Receitas</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Despesas</div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <PieChart size={18} className="text-gray-400" /> Top Despesas (Por Categoria)
                        </h3>
                        <div className="space-y-4">
                            {sortedCategories.length > 0 ? sortedCategories.map(([cat, amount], idx) => {
                                const val = Number(amount);
                                const total = Number(totalCalcExpenses);
                                const percentage = total > 0 ? (val / total) * 100 : 0;
                                const colors = ['bg-primary-600', 'bg-secondary-500', 'bg-slate-400', 'bg-green-500', 'bg-red-400'];
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 font-medium">{cat}</span>
                                            <span className="font-bold text-slate-800">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${percentage}%` }} className={`h-full ${colors[idx % colors.length]}`}></div>
                                        </div>
                                        <p className="text-xs text-gray-400 text-right mt-1">{formatCurrency(val)}</p>
                                    </div>
                                )
                            }) : (
                                <p className="text-center text-gray-400 py-10">Nenhuma despesa registrada.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileText size={18} className="text-gray-400" /> Extrato de Lançamentos
                        </h3>
                        <button
                            onClick={() => navigate('/area-do-filiado/financeiro/detalhes')}
                            className="bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                        >
                            Ver Detalhes Anuais
                        </button>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.length > 0 ? records.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{formatDate(row.transaction_date)}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">{row.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.status === 'paid' ? (
                                                <span className="text-green-600 font-bold text-xs flex items-center gap-1">Check</span>
                                            ) : (
                                                <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-1 rounded">Pendente</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                            {row.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(row.amount))}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Nenhum lançamento encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FinancialDashboard;
