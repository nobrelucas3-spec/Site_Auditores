import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Trash2, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDocuments: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Outros');
    const [year, setYear] = useState(new Date().getFullYear());
    const [isPublic, setIsPublic] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        checkUser();
        fetchDocuments();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/area-do-filiado'); // Redirect if not logged in
        }
        // Ideally checking for specific admin email here
        // if (session?.user.email !== 'auditores.sindical.tce.pe@gmail.com') { ... }
    };

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
            setMessage({ type: 'error', text: 'Por favor, selecione um arquivo e dê um título.' });
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('documents')
                .insert([{
                    title,
                    description,
                    category,
                    is_public: isPublic,
                    file_url: publicUrl,
                    is_public: isPublic,
                    file_url: publicUrl,
                    year: Number(year)
                }]);

            if (dbError) throw dbError;

            setMessage({ type: 'success', text: 'Documento enviado com sucesso!' });

            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            // Reload list
            fetchDocuments();

        } catch (error: any) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: `Erro no upload: ${error.message}` });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            // 1. Delete from Database
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // 2. Delete from Storage (Optional/Advanced: Extract path from URL)
            // For now, simpler to leave file orphan or implement strict storage path logic later
            // To delete from storage we need the relative path, currently we store full URL.
            // We can parse it:
            const path = fileUrl.split('/documents/')[1];
            if (path) {
                await supabase.storage.from('documents').remove([path]);
            }

            setDocuments(prev => prev.filter(doc => doc.id !== id));
            setMessage({ type: 'success', text: 'Documento excluído.' });

        } catch (error: any) {
            console.error('Delete error:', error);
            setMessage({ type: 'error', text: 'Erro ao excluir.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando painel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Gerenciar Documentos</h1>
                    <button onClick={() => navigate('/area-do-filiado/dashboard')} className="text-primary-600 hover:underline">
                        Voltar para Dashboard
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* Upload Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-secondary-500" /> Novo Upload
                    </h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Ex: Estatuto Social 2026"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                >
                                    <option value="Estatuto">Estatuto / Institucional</option>
                                    <option value="Ata">Ata de Reunião</option>
                                    <option value="Financeiro">Prestação de Contas</option>
                                    <option value="Juridico">Jurídico</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Referência</label>
                            <input
                                type="number"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Breve descrição do arquivo..."
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (PDF)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={isPublic}
                                    onChange={e => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">Público? (Visível para todos)</label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
                        >
                            {uploading ? <Loader className="animate-spin" /> : <Upload size={18} />}
                            {uploading ? 'Enviando...' : 'Enviar Documento'}
                        </button>
                    </form>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">Documentos Cadastrados</h2>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{documents.length} arquivos</span>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                        {documents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Nenhum documento encontrado.</div>
                        ) : (
                            documents.map(doc => (
                                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg ${doc.category === 'Estatuto' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{doc.title}</p>
                                            <p className="text-xs text-gray-500 flex gap-2">
                                                <span>{doc.category}</span>
                                                <span>•</span>
                                                <span>{doc.year}</span>
                                                <span>•</span>
                                                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                                {doc.is_public && <span className="text-green-600 font-bold">• Público</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                            title="Visualizar"
                                        >
                                            <FileText size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc.id, doc.file_url)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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

export default AdminDocuments;
