import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    User, 
    Search, 
    Loader2, 
    AlertCircle, 
    Trash2, 
    Power,
    CheckCircle2,
    XCircle
} from 'lucide-react';

interface Member {
    id: string;
    full_name: string;
    email: string;
    email_institutional?: string;
    email_personal?: string;
    matricula: string;
    is_retired: boolean;
    status: string;
    is_associado: boolean;
    is_filiado: boolean;
    joined_at: string;
}

const MembersTab: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterVinculo, setFilterVinculo] = useState<'all' | 'associado' | 'filiado' | 'ambos' | 'nenhum'>('all');
    const [filterRetired, setFilterRetired] = useState<'all' | 'active' | 'retired'>('all');

    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('members')
                .select('*')
                .order('full_name', { ascending: true });

            if (fetchError) throw fetchError;
            setMembers(data || []);
        } catch (err: any) {
            setError('Erro ao carregar membros.');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (member: Member) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        setProcessingId(member.id);
        try {
            const { error: updateError } = await supabase
                .from('members')
                .update({ status: newStatus })
                .eq('id', member.id);

            if (updateError) throw updateError;
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
        } catch (err: any) {
            alert('Erro ao atualizar status: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setProcessingId(null);
        }
    };

    const toggleAffiliation = async (member: Member, field: 'is_associado' | 'is_filiado') => {
        const newValue = !member[field];
        const otherField = field === 'is_associado' ? 'is_filiado' : 'is_associado';
        const otherValue = member[otherField];

        const shouldBeInactive = !newValue && !otherValue;
        const shouldBeActive = newValue; 
        
        setProcessingId(`${member.id}-${field}`);
        try {
            const updatePayload: any = { [field]: newValue };
            if (shouldBeInactive) {
                updatePayload.status = 'inactive';
            } else if (shouldBeActive) {
                updatePayload.status = 'active';
            }

            const { data, error: updateError } = await supabase
                .from('members')
                .update(updatePayload)
                .eq('id', member.id)
                .select();

            if (updateError) throw updateError;
            
            if (!data || data.length === 0) {
                alert('O banco de dados recusou a alteração. Verifique as permissões de segurança (RLS).');
                return;
            }

            setMembers(prev => prev.map(m => 
                m.id === member.id ? { ...m, ...data[0] } : m
            ));
        } catch (err: any) {
            console.error('Erro ao atualizar:', err);
            alert('Erro de conexão ou permissão ao salvar.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir permanentemente o membro ${name}? Esta ação não remove o login do Supabase Auth, apenas o perfil de membro.`)) return;

        setProcessingId(id);
        try {
            const { error: deleteError } = await supabase
                .from('members')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            alert('Erro ao excluir membro.');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredMembers = members.filter(m => {
        const name = m.full_name?.toLowerCase() || '';
        const emailPrimary = m.email?.toLowerCase() || '';
        const emailInst = m.email_institutional?.toLowerCase() || '';
        const emailPers = m.email_personal?.toLowerCase() || '';
        const matricula = m.matricula || '';
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = name.includes(search) || 
                             emailPrimary.includes(search) ||
                             emailInst.includes(search) ||
                             emailPers.includes(search) ||
                             matricula.includes(search);
        
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        const matchesRetired = filterRetired === 'all' || 
                              (filterRetired === 'retired' && m.is_retired) || 
                              (filterRetired === 'active' && !m.is_retired);

        let matchesVinculo = true;
        if (filterVinculo === 'associado') matchesVinculo = m.is_associado && !m.is_filiado;
        else if (filterVinculo === 'filiado') matchesVinculo = m.is_filiado && !m.is_associado;
        else if (filterVinculo === 'ambos') matchesVinculo = m.is_associado && m.is_filiado;
        else if (filterVinculo === 'nenhum') matchesVinculo = !m.is_associado && !m.is_filiado;

        return matchesSearch && matchesStatus && matchesVinculo && matchesRetired;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, e-mail ou matrícula..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-slate-800">{filteredMembers.length}</span> membros encontrados
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2"><AlertCircle size={20}/>{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40}/></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Membro</div>
                                        {/* Filtro implícito pela busca já existente */}
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Matrícula</div>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Situação</div>
                                        <select 
                                            value={filterRetired}
                                            onChange={(e) => setFilterRetired(e.target.value as any)}
                                            className="text-[10px] border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="active">Na Ativa</option>
                                            <option value="retired">Aposentado</option>
                                        </select>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Vínculo</div>
                                        <select 
                                            value={filterVinculo}
                                            onChange={(e) => setFilterVinculo(e.target.value as any)}
                                            className="text-[10px] border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="associado">Associado</option>
                                            <option value="filiado">Filiado</option>
                                            <option value="ambos">Ambos</option>
                                            <option value="nenhum">Nenhum</option>
                                        </select>
                                    </th>
                                    <th className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Status</div>
                                        <select 
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as any)}
                                            className="text-[10px] border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <div className="text-xs font-bold text-gray-500 uppercase">Ações</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map(member => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{member.full_name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                                <div className="flex gap-2 mt-1">
                                                    {member.email_institutional && member.email_institutional.toLowerCase().trim() !== member.email.toLowerCase().trim() && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded" title="Institucional">Inst: {member.email_institutional}</span>
                                                    )}
                                                    {member.email_personal && member.email_personal.toLowerCase().trim() !== member.email.toLowerCase().trim() && member.email_personal.toLowerCase().trim() !== member.email_institutional?.toLowerCase().trim() && (
                                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded" title="Pessoal">Pers: {member.email_personal}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">{member.matricula}</td>
                                            <td className="px-6 py-4">
                                                {member.is_retired ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase">Aposentado</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold uppercase">Ativa</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    <button 
                                                        onClick={() => toggleAffiliation(member, 'is_associado')}
                                                        disabled={processingId?.startsWith(member.id)}
                                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                            member.is_associado 
                                                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through'
                                                        }`}
                                                    >
                                                        {processingId === `${member.id}-is_associado` ? <Loader2 size={10} className="animate-spin" /> : null}
                                                        Associado
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleAffiliation(member, 'is_filiado')}
                                                        disabled={processingId?.startsWith(member.id)}
                                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                                            member.is_filiado 
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 line-through'
                                                        }`}
                                                    >
                                                        {processingId === `${member.id}-is_filiado` ? <Loader2 size={10} className="animate-spin" /> : null}
                                                        Filiado
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {member.status === 'active' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleDelete(member.id, member.full_name)}
                                                disabled={processingId === member.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-gray-400 italic">
                                            Nenhum membro encontrado com os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersTab;
