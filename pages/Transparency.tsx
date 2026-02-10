import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { FileBarChart, Download, Eye, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

const Transparency: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ revenue: 0, expenses: 0, balance: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinancialSummary = async () => {
      setLoading(true);

      let calculatedBalance = 0;
      let currentRevenue = 0;
      let currentExpenses = 0;

      const startYear = 2026;

      // Loop from startYear up to selected year to get accumulated balance
      for (let y = startYear; y <= year; y++) {
        const tableName = `finances_${y}`;

        const { data, error } = await supabase
          .from(tableName as any)
          .select('*');

        if (!error && data) {
          // Process Income
          const yearIncomeData = data.filter((r: any) => r.type === 'income' && r.status === 'paid');

          // Separate Operating Revenue from Carry Over (Saldo Anterior)
          const operatingRevenue = yearIncomeData
            .filter((r: any) => r.category !== 'Saldo Anterior' && !r.description.toLowerCase().includes('saldo anterior'))
            .reduce((acc: number, r: any) => acc + Number(r.amount), 0);

          const carryOverRevenue = yearIncomeData
            .filter((r: any) => r.category === 'Saldo Anterior' || r.description.toLowerCase().includes('saldo anterior'))
            .reduce((acc: number, r: any) => acc + Number(r.amount), 0);

          const totalYearIncome = operatingRevenue + carryOverRevenue;

          const yearExpense = data
            .filter((r: any) => r.type === 'expense' && r.status === 'paid')
            .reduce((acc: number, r: any) => acc + Number(r.amount), 0);

          calculatedBalance += (totalYearIncome - yearExpense);

          // If this is the selected year, save specific metrics
          if (y === year) {
            currentRevenue = operatingRevenue; // Show only operating revenue in the "Receita" card
            currentExpenses = yearExpense;
          }
        }
      }

      setSummary({
        revenue: currentRevenue,
        expenses: currentExpenses,
        balance: calculatedBalance // Accumulated from 2024 to Current
      });

      // Fetch Documents for this year
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .eq('year', year)
        .order('created_at', { ascending: false });

      if (docs) setDocuments(docs);

      setLoading(false);
    };

    fetchFinancialSummary();
  }, [year]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white p-3 rounded-full shadow-sm text-secondary-500">
            <FileBarChart size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Portal da Transparência</h1>
            <p className="text-gray-600">Acesso público às contas e documentos oficiais da associação.</p>
          </div>
        </div>

        {/* Dynamic Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-green-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Receita Total ({year})</h3>
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {loading ? '...' : formatCurrency(summary.revenue)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-red-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Despesas ({year})</h3>
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {loading ? '...' : formatCurrency(summary.expenses)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Saldo em Caixa</h3>
              <DollarSign size={20} className="text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {loading ? '...' : formatCurrency(summary.balance)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Acumulado até o momento</p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-lg text-slate-800">Documentos e Relatórios - {year}</h2>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white outline-none font-medium text-gray-700"
            >
              <option value={2026}>2026</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">Nenhum documento público encontrado para {year}.</div>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{doc.title}</h3>
                      <p className="text-sm text-gray-500">{doc.category} • Publicado em: {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <Eye size={16} /> Visualizar
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transparency;