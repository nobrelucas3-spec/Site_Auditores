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
    X,
    HelpCircle 
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

    // Estado específico para e-mail não confirmado
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);

    // Modal de reenvio avulso
    const [isResendModalOpen, setIsResendModalOpen] = useState(false);
    const [modalEmail, setModalEmail] = useState('');
    const [modalResendLoading, setModalResendLoading] = useState(false);
    const [modalSuccess, setModalSuccess] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    // Contagem regressiva de 2 minutos (120s) persistida por e-mail
    const activeTargetEmail = unconfirmedEmail || email;
    const { isCoolingDown, formattedTime, startCooldown } = useEmailCooldown(activeTargetEmail || 'login', 120);
    const modalCooldown = useEmailCooldown(modalEmail || 'modal', 120);

    useEffect(() => {
        // Capturar erro de redirecionamento, se houver
        if (location.state?.error) {
            setError(location.state.error);
        }

        // Verificar se caiu com link expirado na hash da URL
        const hash = window.location.hash || '';
        if (hash.includes('error_code=otp_expired') || hash.includes('Email+link+is+invalid+or+has+expired')) {
            setError('O link de ativação acessado expirou ou já foi utilizado. Solicite o reenvio de um novo e-mail abaixo.');
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUnconfirmedEmail(null);
        setResendSuccess(null);

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

    const handleResendConfirmation = async (targetEmail: string, isFromModal = false) => {
        const clean = targetEmail.trim();
        if (!clean) {
            if (isFromModal) setModalError('Por favor, informe o seu e-mail.');
            return;
        }

        if (isFromModal) {
            setModalResendLoading(true);
            setModalError(null);
            setModalSuccess(null);
        } else {
            setResendLoading(true);
            setResendSuccess(null);
        }

        try {
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

            if (isFromModal) {
                modalCooldown.startCooldown(120);
                setModalSuccess(`Novo e-mail de ativação enviado para ${clean}! Verifique sua caixa de entrada e spam.`);
            } else {
                startCooldown(120);
                setResendSuccess(`Novo e-mail de ativação enviado para ${clean}! Verifique sua caixa de entrada e spam.`);
            }
        } catch (err: any) {
            const msg = err.message || 'Erro ao reenviar e-mail de confirmação.';
            if (isFromModal) {
                setModalError(msg);
            } else {
                setError(msg);
            }
        } finally {
            if (isFromModal) {
                setModalResendLoading(false);
            } else {
                setResendLoading(false);
            }
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

                    {/* BLOCO ESPECÍFICO: E-mail Não Confirmado com Botão de Reenvio */}
                    {unconfirmedEmail && (
                        <div className="rounded-2xl bg-amber-50/90 p-4 sm:p-5 border border-amber-200 text-amber-950 space-y-3.5 animate-in fade-in duration-200">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                    <Mail size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-amber-950">
                                        Cadastro realizado, mas e-mail não confirmado
                                    </h4>
                                    <p className="text-xs text-amber-900 leading-relaxed">
                                        Sua conta já existe para <strong>{unconfirmedEmail}</strong>! No entanto, para liberar o seu acesso, é obrigatório clicar no link de ativação enviado para sua caixa de entrada.
                                    </p>
                                    <p className="text-[11px] text-amber-800 font-medium">
                                        💡 Verifique também sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
                                    </p>
                                </div>
                            </div>

                            {resendSuccess && (
                                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                    <span>{resendSuccess}</span>
                                </div>
                            )}

                            <div>
                                <button
                                    type="button"
                                    disabled={resendLoading || isCoolingDown}
                                    onClick={() => handleResendConfirmation(unconfirmedEmail)}
                                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                                        isCoolingDown
                                            ? 'bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed'
                                            : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                                    }`}
                                >
                                    {resendLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : isCoolingDown ? (
                                        <>
                                            <Clock size={15} />
                                            Reenviar e-mail de ativação (aguarde {formattedTime})
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={15} />
                                            Reenviar E-mail de Confirmação
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BLOCO: Credenciais Incorretas com atalho claro para Primeiro Acesso */}
                    {error === 'invalid_credentials' && (
                        <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-red-900 space-y-2.5 animate-in fade-in duration-200">
                            <div className="flex items-start gap-2.5">
                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                <div className="text-xs space-y-1">
                                    <h4 className="font-bold text-sm text-red-950">E-mail ou senha incorretos</h4>
                                    <p className="text-red-800 leading-relaxed">
                                        Verifique se digitou a senha correta. Caso você seja associado e ainda não tenha criado sua senha, acesse o <strong>Primeiro Acesso</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200/60">
                                <Link 
                                    to="/primeiro-acesso" 
                                    className="text-xs font-bold text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors inline-flex items-center gap-1 shadow-2xs"
                                >
                                    Fazer Primeiro Acesso &rarr;
                                </Link>
                                <Link 
                                    to="/esqueci-senha" 
                                    className="text-xs font-semibold text-red-700 px-2 py-1 hover:underline"
                                >
                                    Esqueci minha senha
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* OUTROS ERROS GENÉRICOS */}
                    {error && error !== 'invalid_credentials' && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-100 animate-fade-in">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
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

                    {/* Link direto para reenvio avulso */}
                    <div className="text-center pt-3 border-t border-slate-100 mt-5">
                        <button
                            type="button"
                            onClick={() => {
                                setModalEmail(email);
                                setModalSuccess(null);
                                setModalError(null);
                                setIsResendModalOpen(true);
                            }}
                            className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors inline-flex items-center gap-1.5"
                        >
                            <Mail size={14} className="text-slate-400" />
                            Não recebeu o e-mail de ativação? <span className="underline">Reenviar link</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL DE REENVIO DE E-MAIL DE ATIVAÇÃO */}
            {isResendModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900">
                                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                                    <Mail size={18} />
                                </div>
                                <h3 className="font-bold text-base">Reenviar E-mail de Ativação</h3>
                            </div>
                            <button 
                                onClick={() => setIsResendModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Informe o seu e-mail cadastrado. Se houver uma conta criada pendente de confirmação, enviaremos um novo link de ativação com validade renovada.
                        </p>

                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Seu E-mail Cadastrado</label>
                            <input
                                type="email"
                                value={modalEmail}
                                onChange={(e) => setModalEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        {modalError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600 shrink-0" />
                                <span>{modalError}</span>
                            </div>
                        )}

                        {modalSuccess && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                <span>{modalSuccess}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsResendModalOpen(false)}
                                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                            >
                                Fechar
                            </button>

                            <button
                                type="button"
                                disabled={modalResendLoading || modalCooldown.isCoolingDown || !modalEmail}
                                onClick={() => handleResendConfirmation(modalEmail, true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    modalCooldown.isCoolingDown
                                        ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                                }`}
                            >
                                {modalResendLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : modalCooldown.isCoolingDown ? (
                                    <>
                                        <Clock size={14} />
                                        Aguarde {modalCooldown.formattedTime}
                                    </>
                                ) : (
                                    <>
                                        <Mail size={14} />
                                        Reenviar Agora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberLogin;
