import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Trash2, Upload, FileText, CheckCircle, AlertCircle, Loader, Search } from 'lucide-react';

const DocumentsTab: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Outros');
    const [year, setYear] = useState(new Date().getFullYear());
    const [isPublic, setIsPublic] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching docs:', error);
        if (data) setDocuments(data);
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!file || !title) {
            setMessage({ type: 'error', text: 'Selecione um arquivo e informe o título.' });
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('documents')
                .insert([{
                    title,
                    description,
                    category,
                    is_public: isPublic,
                    file_url: publicUrl,
                    year: Number(year)
                }]);

            if (dbError) throw dbError;

            setMessage({ type: 'success', text: 'Documento enviado com sucesso!' });
            setTitle('');
            setDescription('');
            setFile(null);
            fetchDocuments();
        } catch (error: any) {
            setMessage({ type: 'error', text: `Erro: ${error.message}` });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
            if (dbError) throw dbError;

            const path = fileUrl.split('/documents/')[1];
            if (path) {
                await supabase.storage.from('documents').remove([path]);
            }

            setDocuments(prev => prev.filter(doc => doc.id !== id));
            setMessage({ type: 'success', text: 'Documento excluído.' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erro ao excluir.' });
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Upload size={20} className="text-primary-600" /> Carregar Novo Documento
                </h2>
                
                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Ex: Estatuto Social Atualizado"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none"
                            >
                                <option value="Estatuto">Estatuto / Institucional</option>
                                <option value="Ata">Ata de Reunião</option>
                                <option value="Financeiro">Prestação de Contas</option>
                                <option value="Juridico">Jurídico</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ano</label>
                            <input
                                type="number"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descrição Curta</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Arquivo referente a..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Arquivo (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={e => setIsPublic(e.target.checked)}
                                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <label htmlFor="isPublic" className="text-sm font-bold text-gray-700">Tornar Público? <span className="font-normal text-gray-500">(Visível sem login)</span></label>
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md shadow-primary-200"
                        >
                            {uploading ? <Loader className="animate-spin" /> : <Upload size={20} />}
                            {uploading ? 'Enviando...' : 'Carregar Documento'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden text-sm">
                <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-slate-700">Documentos no Sistema</h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar documentos..." 
                            className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader className="animate-spin text-gray-300" size={32}/></div>
                    ) : filteredDocs.length > 0 ? (
                        filteredDocs.map(doc => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${doc.category === 'Financeiro' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{doc.title}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            {doc.category} • {doc.year} {doc.is_public && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Público</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-primary-600"><FileText size={18}/></a>
                                    <button onClick={() => handleDelete(doc.id, doc.file_url)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-gray-400 italic">Nenhum documento cadastrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentsTab;
