import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Filter, Download, Calendar } from 'lucide-react';
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

const FinancialDetailed: React.FC = () => {
    const navigate = useNavigate();
    useInactivityTimer(15);

    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // State for expanded months (accordion)
    const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

    useEffect(() => {
        // Since we are using separate tables per year (finances_YYYY), 
        // we can't query a single table to find all available years.
        // We will generate a range of years from 2024 (start of project) to Current Year + 1.
        const currentYear = new Date().getFullYear();
        const startYear = 2024;
        const yearsString = [];

        for (let y = currentYear + 1; y >= startYear; y--) {
            yearsString.push(y);
        }
        setAvailableYears(yearsString);

        // Default to current year if available, otherwise first one
        setYear(prev => yearsString.includes(prev) ? prev : currentYear);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!year) return;
            setLoading(true);
            setRecords([]); // Clear previous records while loading

            // Dynamic table name based on user selection
            const tableName = `finances_${year}`;

            // We don't need date filtering inside the query if the table is already separated by year,
            // but keeping it doesn't hurt and ensures data integrity.
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            try {
                const { data: recordsData, error } = await supabase
                    .from(tableName as any) // Type casting as explicit table names might not be in generated types
                    .select('*')
                    .order('transaction_date', { ascending: false });

                if (error) {
                    // Start of the year or table doesn't exist yet
                    console.warn(`Could not fetch data for ${tableName}. It might not exist yet.`, error);
                    setLoading(false);
                } else if (recordsData) {
                    setRecords(recordsData as FinancialRecord[]);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Unexpected error fetching financial data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    const toggleMonth = (month: string) => {
        setExpandedMonths(prev =>
            prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
        );
    };

    // Helpers
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
    };

    const getMonthName = (dateString: string) => {
        const [y, m] = dateString.split('-');
        const date = new Date(Number(y), Number(m) - 1, 1);
        return date.toLocaleDateString('pt-BR', { month: 'long' });
    };

    // Grouping
    const groupedRecords = records.reduce((acc, record) => {
        const month = getMonthName(record.transaction_date);
        if (!acc[month]) acc[month] = [];
        acc[month].push(record);
        return acc;
    }, {} as Record<string, FinancialRecord[]>);

    // Get unique months in order of appearance (which is date desc)
    const uniqueMonths: string[] = Array.from(new Set(records.map(r => getMonthName(r.transaction_date))));

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/area-do-filiado/financeiro')} className="text-gray-400 hover:text-primary-600 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="font-bold text-slate-800 text-lg">Prestação de Contas Detalhada</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">

                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <Filter size={20} />
                        </div>
                        <span className="font-bold text-gray-700">Filtrar por Ano:</span>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Saldo Realizado (Pago)</p>
                            <p className="font-bold text-lg text-slate-800">
                                {formatCurrency(records
                                    .filter(r => r.status === 'paid')
                                    .reduce((acc, r) => acc + (r.type === 'income' ? Math.abs(Number(r.amount)) : -Math.abs(Number(r.amount))), 0)
                                )}
                            </p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Download size={18} /> Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Mês / Detalhes</th>
                                    <th className="px-6 py-4 text-right">Entradas (Pago)</th>
                                    <th className="px-6 py-4 text-right">Saídas (Pago)</th>
                                    <th className="px-6 py-4 text-right">Resultado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Carregando registros...
                                        </td>
                                    </tr>
                                ) : uniqueMonths.length > 0 ? (
                                    uniqueMonths.map((month) => {
                                        const monthRecords = groupedRecords[month];
                                        const income = monthRecords.filter(r => r.status === 'paid' && r.type === 'income').reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0);
                                        const expense = monthRecords.filter(r => r.status === 'paid' && r.type === 'expense').reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0);
                                        const balance = income - expense;
                                        const isExpanded = expandedMonths.includes(month);

                                        return (
                                            <React.Fragment key={month}>
                                                {/* Summary Row */}
                                                <tr
                                                    onClick={() => toggleMonth(month)}
                                                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                                                >
                                                    <td className="px-6 py-4 font-bold text-slate-800 uppercase flex items-center gap-2">
                                                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                            <Filter size={16} className="text-gray-400" />
                                                        </div>
                                                        {month}
                                                        <span className="text-xs font-normal text-gray-500 normal-case ml-2">({monthRecords.length} lançamentos)</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-green-600 font-medium">
                                                        {formatCurrency(income)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-red-500 font-medium">
                                                        {formatCurrency(expense)}
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                                        {formatCurrency(balance)}
                                                    </td>
                                                </tr>

                                                {/* Details Row (Accordion) */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={4} className="p-0">
                                                            <div className="bg-gray-50 px-6 py-4 border-t border-b border-gray-100 shadow-inner">
                                                                <table className="w-full text-xs bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                                                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left">Data</th>
                                                                            <th className="px-4 py-2 text-left">Descrição</th>
                                                                            <th className="px-4 py-2 text-left">Categoria</th>
                                                                            <th className="px-4 py-2 text-center">Status</th>
                                                                            <th className="px-4 py-2 text-right">Valor</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {monthRecords.map((row: FinancialRecord) => (
                                                                            <tr key={row.id}>
                                                                                <td className="px-6 py-4 font-medium text-gray-900">{formatDate(String(row.transaction_date))}</td>
                                                                                <td className="px-4 py-3">{row.description}</td>
                                                                                <td className="px-4 py-3">
                                                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                                                        {row.category}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-4 py-3 text-center">
                                                                                    {row.status === 'paid' ? (
                                                                                        <span className="text-green-600 font-bold">Pago</span>
                                                                                    ) : (
                                                                                        <span className="text-yellow-600 font-bold bg-yellow-50 px-2 rounded">Pendente</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className={`px-4 py-3 text-right font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                                                    {row.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(row.amount))}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Nenhum lançamento encontrado para o ano de {year}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {records.length > 0 && (
                                <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-gray-900">
                                    <tr>
                                        <td className="px-6 py-4 uppercase text-xs tracking-wider text-gray-500">Total Anual</td>
                                        <td className="px-6 py-4 text-right text-green-600">
                                            {formatCurrency(records.filter(r => r.status === 'paid' && r.type === 'income').reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0))}
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-500">
                                            {formatCurrency(records.filter(r => r.status === 'paid' && r.type === 'expense').reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0))}
                                        </td>
                                        <td className={`px-6 py-4 text-right text-lg ${records.filter(r => r.status === 'paid').reduce((acc, r) => acc + (r.type === 'income' ? Math.abs(Number(r.amount)) : -Math.abs(Number(r.amount))), 0) >= 0
                                            ? 'text-blue-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(records
                                                .filter(r => r.status === 'paid')
                                                .reduce((acc, r) => acc + (r.type === 'income' ? Math.abs(Number(r.amount)) : -Math.abs(Number(r.amount))), 0)
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default FinancialDetailed;
