import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    Lock, 
    User, 
    AlertCircle, 
    ArrowRight, 
    Loader2, 
    Mail, 
    CheckCircle2, 
    Clock, 
    ShieldCheck
} from 'lucide-react';
import { useEmailCooldown } from '../hooks/useEmailCooldown';

const MemberLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Estado específico para e-mail não confirmado e validação por código OTP
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const [loginOtpCode, setLoginOtpCode] = useState('');
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
    const [verifyOtpError, setVerifyOtpError] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);

    // Contagem regressiva de 2 minutos (120s) persistida por e-mail
    const activeTargetEmail = unconfirmedEmail || email;
    const { isCoolingDown, formattedTime, startCooldown } = useEmailCooldown(activeTargetEmail || 'login', 120);

    useEffect(() => {
        // Capturar erro de redirecionamento, se houver
        if (location.state?.error) {
            setError(location.state.error);
        }

        // Verificar se caiu com link expirado na hash da URL
        const hash = window.location.hash || '';
        if (hash.includes('error_code=otp_expired') || hash.includes('Email+link+is+invalid+or+has+expired')) {
            setError('O código de ativação expirou ou já foi utilizado. Solicite o envio de um novo código de confirmação.');
        }

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Verificar se ainda é ativo antes de manter logado
                    const cleanEmail = (session.user.email || '').trim();
                    const { data: member } = await supabase
                        .from('members')
                        .select('status')
                        .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
                        .maybeSingle();

                    if (member?.status === 'active') {
                        navigate('/area-do-filiado/dashboard');
                        return;
                    } else {
                        await supabase.auth.signOut();
                    }
                }
            } catch (err) {
                console.error('Erro ao verificar sessão:', err);
            } finally {
                setCheckingSession(false);
            }
        };
        checkSession();
    }, [navigate, location]);

    const handleVerifyLoginOtp = async (targetEmail: string, codeToVerify: string) => {
        const cleanEmail = targetEmail.trim();
        const cleanCode = codeToVerify.replace(/\D/g, '').trim();

        if (cleanCode.length < 6 || cleanCode.length > 8) {
            setVerifyOtpError('Por favor, digite o código numérico completo recebido no e-mail.');
            return;
        }

        setVerifyOtpLoading(true);
        setVerifyOtpError(null);

        try {
            let { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: cleanCode,
                type: 'signup'
            });

            if (verifyErr) {
                const msgLower = (verifyErr.message || '').toLowerCase();
                if (msgLower.includes('type') || msgLower.includes('invalid token')) {
                    const fallback = await supabase.auth.verifyOtp({
                        email: cleanEmail,
                        token: cleanCode,
                        type: 'email'
                    });
                    if (!fallback.error) {
                        verifyData = fallback.data;
                        verifyErr = null;
                    }
                }
            }

            if (verifyErr) {
                throw new Error('Código inválido ou expirado. Verifique os números recebidos no e-mail.');
            }

            // Verificar se o associado está com status ativo
            const { data: member, error: memberErr } = await supabase
                .from('members')
                .select('status')
                .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
                .maybeSingle();

            if (memberErr || !member || member.status !== 'active') {
                navigate('/area-do-filiado/dashboard');
                return;
            }

            const destination = location.state?.from || '/area-do-filiado/dashboard';
            navigate(destination);
        } catch (err: any) {
            setVerifyOtpError(err.message || 'Erro ao validar código.');
        } finally {
            setVerifyOtpLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUnconfirmedEmail(null);
        setResendSuccess(null);
        setVerifyOtpError(null);

        const cleanEmail = email.trim();

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
        });

        if (loginError) {
            const errLower = (loginError.message || '').toLowerCase();
            if (errLower.includes('email not confirmed')) {
                setUnconfirmedEmail(cleanEmail);
                setError(null);
            } else if (errLower.includes('invalid login credentials')) {
                setError('invalid_credentials');
            } else {
                setError(`Erro: ${loginError.message}`);
            }
            setLoading(false);
            return;
        }

        // Se o login foi bem sucedido:
        const { data: member, error: memberError } = await supabase
            .from('members')
            .select('status, full_name')
            .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
            .maybeSingle();

        if (memberError) {
            await supabase.auth.signOut();
            setError(`Erro de Banco de Dados (RLS): ${memberError.message}. Por favor, verifique se executou o script SQL.`);
            setLoading(false);
            return;
        }

        if (!member) {
            await supabase.auth.signOut();
            setError(`O e-mail "${cleanEmail}" não foi encontrado no cadastro de membros. Verifique se este é o seu e-mail oficial de sócio.`);
            setLoading(false);
            return;
        }

        if (member.status !== 'active') {
            await supabase.auth.signOut();
            setError(`Sua conta está com o status "${member.status}". Apenas membros com status "active" podem acessar o portal.`);
            setLoading(false);
            return;
        }

        const destination = location.state?.from || '/area-do-filiado/dashboard';
        navigate(destination);
    };

    const handleResendConfirmation = async (targetEmail: string) => {
        const clean = targetEmail.trim();
        if (!clean) {
            setError('Por favor, informe o seu e-mail.');
            return;
        }

        setResendLoading(true);
        setResendSuccess(null);
        setVerifyOtpError(null);

        try {
            // 1. Verificar via RPC segura se o e-mail pertence a um associado ativo
            const { data: authStatus, error: rpcErr } = await supabase.rpc('check_member_auth_status', {
                p_email: clean
            });

            if (!rpcErr && authStatus) {
                const isActiveMember = typeof authStatus.is_active_member === 'boolean'
                    ? authStatus.is_active_member
                    : (authStatus.reason !== 'not_member' && authStatus.reason !== 'inactive_member');

                if (!isActiveMember) {
                    throw new Error(authStatus.message || 'E-mail não autorizado ou inativo no cadastro de associados.');
                }
            } else {
                // Fallback compatível antes da execução do script SQL
                const { data: member, error: memberErr } = await supabase
                    .from('members')
                    .select('id, status, is_associado, is_filiado')
                    .or(`email.ilike.${clean},email_institutional.ilike.${clean},email_personal.ilike.${clean}`)
                    .maybeSingle();

                if (memberErr || !member) {
                    throw new Error('E-mail não encontrado no cadastro de associados.');
                }

                if (member.status !== 'active') {
                    throw new Error('Seu cadastro de associado consta como inativo. Entre em contato com a associação.');
                }

                if (!member.is_associado && !member.is_filiado) {
                    throw new Error('Apenas associados ou filiados ativos podem solicitar códigos de acesso.');
                }
            }

            const { error: resendErr } = await supabase.auth.resend({
                type: 'signup',
                email: clean,
                options: {
                    emailRedirectTo: `${window.location.origin}/#/area-do-filiado`
                }
            });

            if (resendErr) {
                const msgLower = (resendErr.message || '').toLowerCase();
                if (msgLower.includes('rate limit') || msgLower.includes('too many')) {
                    throw new Error('Limite temporário de envios atingido. Por favor, aguarde alguns instantes.');
                }
                throw resendErr;
            }

            startCooldown(120);
            setResendSuccess(`Novo código de confirmação enviado para ${clean}! Verifique sua caixa de entrada.`);
        } catch (err: any) {
            setError(err.message || 'Erro ao reenviar código de confirmação.');
        } finally {
            setResendLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-500 font-medium tracking-tight">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                <div className="text-center">
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Área do Filiado</h2>
                    <p className="text-sm text-gray-500">
                        Acesse documentos e informações exclusivas para associados.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BLOCO ESPECÍFICO: E-mail Não Confirmado com Campo de Código OTP */}
                    {unconfirmedEmail && (
                        <div className="rounded-2xl bg-amber-50/95 p-5 border border-amber-200 text-amber-950 space-y-4 animate-in fade-in duration-200 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                    <ShieldCheck size={22} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-amber-950">
                                        Ativação Pendente: Digite o Código de Confirmação
                                    </h4>
                                    <p className="text-xs text-amber-900 leading-relaxed">
                                        Sua conta já foi criada para <strong>{unconfirmedEmail}</strong>. Para liberar seu acesso, digite o código numérico enviado para seu e-mail:
                                    </p>
                                    <p className="text-[11px] text-amber-800 font-medium">
                                        💡 Verifique sua caixa de entrada e também a pasta de Spam.
                                    </p>
                                </div>
                            </div>

                            {/* Campo de Código OTP */}
                            <div className="space-y-2 pt-1">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={8}
                                        placeholder="Código"
                                        value={loginOtpCode}
                                        onChange={(e) => {
                                            setLoginOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                                            if (verifyOtpError) setVerifyOtpError(null);
                                        }}
                                        className="flex-1 tracking-[0.2em] sm:tracking-[0.3em] text-center text-lg font-mono font-bold py-2.5 px-3 border-2 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 rounded-xl bg-white outline-hidden text-slate-900 placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        disabled={verifyOtpLoading || loginOtpCode.length < 6}
                                        onClick={() => handleVerifyLoginOtp(unconfirmedEmail, loginOtpCode)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                                            loginOtpCode.length >= 6 && !verifyOtpLoading
                                                ? 'bg-amber-700 hover:bg-amber-800 text-white cursor-pointer shadow-md'
                                                : 'bg-amber-200 text-amber-600 cursor-not-allowed'
                                        }`}
                                    >
                                        {verifyOtpLoading ? <Loader2 size={15} className="animate-spin" /> : 'Ativar e Entrar'}
                                    </button>
                                </div>

                                {verifyOtpError && (
                                    <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle size={15} className="text-rose-600 shrink-0" />
                                        <span>{verifyOtpError}</span>
                                    </div>
                                )}

                                {resendSuccess && (
                                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                        <span>{resendSuccess}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <button
                                    type="button"
                                    disabled={resendLoading || isCoolingDown}
                                    onClick={() => handleResendConfirmation(unconfirmedEmail)}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        isCoolingDown
                                            ? 'bg-amber-100/70 text-amber-700 border border-amber-200 cursor-not-allowed'
                                            : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer'
                                    }`}
                                >
                                    {resendLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : isCoolingDown ? (
                                        <>
                                            <Clock size={14} /> Reenviar código ({formattedTime})
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={14} /> Reenviar código de confirmação
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de Erro Limpa e Sem Redundâncias */}
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-red-900 text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                            <span className="font-semibold text-red-900">
                                {error === 'invalid_credentials' ? 'E-mail ou senha incorretos.' : error}
                            </span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                <>
                                    Entrar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-4">
                        <Link to="/esqueci-senha" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
                            Esqueceu a senha?
                        </Link>
                        <Link to="/primeiro-acesso" className="font-medium text-secondary-600 hover:text-secondary-500 hover:underline">
                            Primeiro acesso?
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default MemberLogin;
