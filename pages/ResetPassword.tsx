import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertCircle, Loader2, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const ResetPassword: React.FC = () => {
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Checar se já existe sessão de recuperação ativa
    useEffect(() => {
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setHasActiveSession(true);
            }
        };
        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
                setHasActiveSession(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            // Se não tem sessão ativa, primeiro valida o código numérico com type 'recovery'
            if (!hasActiveSession) {
                const cleanEmail = email.trim();
                const cleanToken = otpCode.replace(/\D/g, '').trim();

                if (!cleanEmail) {
                    throw new Error('Informe seu e-mail cadastrado.');
                }
                if (cleanToken.length < 6 || cleanToken.length > 8) {
                    throw new Error('Informe o código de segurança numérico recebido por e-mail.');
                }

                // Verificar se o e-mail pertence a um associado ativo
                const { data: member, error: memberErr } = await supabase
                    .from('members')
                    .select('id, status, is_associado, is_filiado')
                    .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
                    .maybeSingle();

                if (memberErr || !member || member.status !== 'active' || (!member.is_associado && !member.is_filiado)) {
                    throw new Error('E-mail não encontrado ou inativo no cadastro de associados.');
                }

                const { error: otpErr } = await supabase.auth.verifyOtp({
                    email: cleanEmail,
                    token: cleanToken,
                    type: 'recovery'
                });

                if (otpErr) {
                    throw new Error('Código inválido ou expirado. Verifique os números no seu e-mail.');
                }
            }

            // Atualizar senha
            const { error: updateErr } = await supabase.auth.updateUser({
                password: password
            });

            if (updateErr) throw updateErr;

            setSuccess(true);
            setTimeout(() => {
                navigate('/area-do-filiado');
            }, 2500);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center space-y-4">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Senha Atualizada!</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Sua senha foi redefinida com sucesso. Redirecionando para o login...
                    </p>
                    <Loader2 className="animate-spin mx-auto text-primary-600 mt-2" size={24} />
                    <div className="pt-2">
                        <Link 
                            to="/area-do-filiado" 
                            className="inline-block bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary-700 transition-colors text-xs shadow-xs"
                        >
                            Ir para Login agora &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                <div>
                    <Link to="/area-do-filiado" className="flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-4 text-xs font-semibold">
                        &larr; Voltar ao Login
                    </Link>
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary-600">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Nova Senha</h2>
                    <p className="text-sm text-gray-500">
                        {hasActiveSession 
                            ? 'Defina sua nova senha de acesso abaixo.'
                            : 'Informe seu e-mail, o código de segurança recebido e sua nova senha.'}
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleUpdatePassword}>
                    {!hasActiveSession && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Cadastrado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Segurança (OTP)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={8}
                                        required
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                        className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm font-mono tracking-widest text-center"
                                        placeholder="Código numérico"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Confirme a Nova Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                placeholder="Repita a nova senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 text-white" />
                        ) : (
                            'Salvar Nova Senha'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
