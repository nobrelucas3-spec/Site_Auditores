import React from 'react';

export const HierarchyChart: React.FC = () => {
    const data = [
        {
            name: 'Nível Médio/Técnico (Origem)',
            competencia: 40,
            risco: 80,
        },
        {
            name: 'Nível Superior (Auditor)',
            competencia: 95,
            risco: 20,
        },
    ];

    return (
        <div className="my-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-center font-bold font-sans text-gray-800 mb-2">Dissonância Cognitiva Institucional</h4>
            <p className="text-center text-sm text-gray-500 mb-6">Comparativo estimado entre complexidade exigida na origem e risco jurídico da decisão</p>

            <div className="flex flex-col gap-6 max-w-lg mx-auto">
                {/* Legend */}
                <div className="flex justify-center gap-4 text-xs mb-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-primary-900 rounded-sm"></div>
                        <span>Complexidade Constitucional</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span>Risco Jurídico na Chefia</span>
                    </div>
                </div>

                {/* Bars */}
                {data.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <p className="text-sm font-bold text-gray-700">{item.name}</p>

                        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden flex">
                            {/* Competencia Bar */}
                            <div
                                style={{ width: `${item.competencia}%` }}
                                className="h-full bg-primary-900 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                            >
                                {item.competencia}%
                            </div>
                        </div>

                        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden flex">
                            {/* Risco Bar */}
                            <div
                                style={{ width: `${item.risco}%` }}
                                className="h-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
                            >
                                {item.risco}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-6 italic">
                *Dados ilustrativos baseados na fundamentação jurídica da Nota Técnica.
            </p>
        </div>
    );
};

export const SalaryBandChart: React.FC = () => {
    // Visualizing the start and end of careers
    return (
        <div className="my-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-center font-bold font-sans text-gray-800 mb-2">Faixas Salariais (Padrão ACE)</h4>
            <p className="text-center text-sm text-gray-500 mb-6">Demonstração da diferença de complexidade reconhecida pela Lei</p>

            <div className="relative h-40 w-full flex flex-col justify-center items-center">
                {/* Custom visualization for bands */}
                <div className="w-full max-w-lg space-y-6">

                    {/* Analista Track */}
                    <div className="relative w-[80%]">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Analista (Faixa 1)</span>
                            <span>Analista (Faixa 8)</span>
                        </div>
                        <div className="h-6 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                            <div className="absolute left-0 w-full h-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">
                                Carreira de Analista
                            </div>
                        </div>
                    </div>

                    {/* Auditor Track */}
                    <div className="relative pl-[20%]"> {/* Shifted to represent starting at level 3 */}
                        <div className="flex justify-between text-xs font-bold text-primary-800 mb-1">
                            <span>Auditor (Faixa 3)</span>
                            <span>Auditor (Faixa 10)</span>
                        </div>
                        <div className="h-8 bg-blue-50 rounded-full overflow-hidden relative border border-primary-200 shadow-md">
                            <div className="absolute left-0 w-[100%] h-full bg-primary-800 flex items-center justify-center text-white text-xs font-bold">
                                Carreira de Auditor (Alta Complexidade)
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
