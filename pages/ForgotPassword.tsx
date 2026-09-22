import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    KeyRound, 
    ArrowLeft, 
    Mail, 
    CheckCircle, 
    CheckCircle2,
    AlertCircle, 
    Loader2, 
    Lock, 
    ShieldCheck, 
    Clock, 
    ArrowRight 
} from 'lucide-react';
import { useEmailCooldown } from '../hooks/useEmailCooldown';

const ForgotPassword: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState((location.state?.email as string) || '');
    const [step, setStep] = useState<'request_code' | 'reset_password'>('request_code');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accountNotice, setAccountNotice] = useState<{
        type: 'no_account' | 'unconfirmed';
        email: string;
        message: string;
    } | null>(null);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { isCoolingDown, formattedTime, startCooldown } = useEmailCooldown(email.trim() || 'forgot_password', 120);

    // Validação estrita do associado e verificação se possui conta ativa no Supabase Auth
    const validateMemberAndAuthStatus = async (targetEmail: string) => {
        const cleanEmail = targetEmail.trim();

        // 1. Tentar validar via RPC oficial de segurança PostgreSQL check_member_auth_status
        try {
            const { data: authStatus, error: rpcErr } = await supabase.rpc('check_member_auth_status', {
                p_email: cleanEmail
            });

            if (!rpcErr && authStatus) {
                if (!authStatus.ok) {
                    if (authStatus.reason === 'no_account') {
                        return {
                            valid: false,
                            notice: {
                                type: 'no_account' as const,
                                email: cleanEmail,
                                message: authStatus.message || 'Identificamos que você é associado, mas ainda não realizou o seu Primeiro Acesso para cadastrar sua senha.'
                            }
                        };
                    }
                    if (authStatus.reason === 'unconfirmed') {
                        return {
                            valid: false,
                            notice: {
                                type: 'unconfirmed' as const,
                                email: cleanEmail,
                                message: authStatus.message || 'Sua conta já foi criada, mas ainda não foi ativada com o código enviado ao seu e-mail.'
                            }
                        };
                    }
                    return {
                        valid: false,
                        error: authStatus.message || 'Não autorizado para recuperação de senha.'
                    };
                }
                return { valid: true };
            }
        } catch (err) {
            console.warn('RPC check_member_auth_status falhou, usando fallback cliente:', err);
        }

        // 2. Fallback de segurança cliente (caso o script SQL do RPC ainda não tenha sido executado)
        const { data: member, error: memberErr } = await supabase
            .from('members')
            .select('id, full_name, email, email_institutional, email_personal, status, is_associado, is_filiado')
            .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
            .maybeSingle();

        if (memberErr || !member) {
            return {
                valid: false,
                error: `O e-mail "${cleanEmail}" não foi encontrado no cadastro de associados. O envio de códigos de recuperação é exclusivo para associados cadastrados.`
            };
        }

        if (member.status !== 'active') {
            return {
                valid: false,
                error: 'Seu cadastro de associado consta como inativo no sistema. Entre em contato com a secretaria da associação.'
            };
        }

        if (!member.is_associado && !member.is_filiado) {
            return {
                valid: false,
                error: 'Apenas associados ou filiados com cadastro ativo podem solicitar recuperação de acesso.'
            };
        }

        // Teste cliente para identificar conta não confirmada
        const { error: testSignErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: '__probe_chk_pwd_xyz987__!',
        });

        if (testSignErr && (testSignErr.message || '').toLowerCase().includes('email not confirmed')) {
            return {
                valid: false,
                notice: {
                    type: 'unconfirmed' as const,
                    email: cleanEmail,
                    message: 'Sua conta já foi iniciada, mas ainda não foi ativada com o código enviado para seu e-mail. Conclua sua ativação no Primeiro Acesso.'
                }
            };
        }

        return { valid: true };
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setError('Por favor, informe seu e-mail cadastrado.');
            return;
        }

        setLoading(true);
        setError(null);
        setAccountNotice(null);
        setResendSuccess(null);

        try {
            const validation = await validateMemberAndAuthStatus(cleanEmail);

            if (!validation.valid) {
                if (validation.notice) {
                    setAccountNotice(validation.notice);
                } else if (validation.error) {
                    setError(validation.error);
                }
                setLoading(false);
                return;
            }

            // Apenas dispara se o associado tem conta ativa e confirmada
            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail);
            if (resetErr) {
                const msgLower = (resetErr.message || '').toLowerCase();
                if (msgLower.includes('rate limit') || msgLower.includes('too many')) {
                    throw new Error('Limite temporário de envios atingido. Aguarde alguns instantes.');
                }
                throw resetErr;
            }

            startCooldown(120);
            setStep('reset_password');
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar código de recuperação.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        const cleanEmail = email.trim();
        if (!cleanEmail) return;

        setResendLoading(true);
        setError(null);
        setResendSuccess(null);

        try {
            const validation = await validateMemberAndAuthStatus(cleanEmail);

            if (!validation.valid) {
                if (validation.notice) {
                    setError(validation.notice.message);
                } else if (validation.error) {
                    setError(validation.error);
                }
                setResendLoading(false);
                return;
            }

            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail);
            if (resetErr) {
                const msgLower = (resetErr.message || '').toLowerCase();
                if (msgLower.includes('rate limit') || msgLower.includes('too many')) {
                    throw new Error('Limite temporário de envios atingido. Aguarde alguns instantes.');
                }
                throw resetErr;
            }

            startCooldown(120);
            setResendSuccess(`Novo código de recuperação enviado para ${cleanEmail}!`);
        } catch (err: any) {
            setError(err.message || 'Erro ao reenviar código de recuperação.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleResetWithOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim();
        const cleanToken = otpCode.replace(/\D/g, '').trim();

        if (cleanToken.length < 6 || cleanToken.length > 8) {
            setError('Por favor, digite o código de confirmação numérico recebido no seu e-mail.');
            return;
        }

        if (newPassword.length < 8) {
            setError('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Valida o código OTP de recuperação
            const { error: verifyErr } = await supabase.auth.verifyOtp({
                email: cleanEmail,
                token: cleanToken,
                type: 'recovery'
            });

            if (verifyErr) {
                throw new Error('Código de segurança inválido ou expirado. Verifique o número recebido no e-mail.');
            }

            // 2. Com a sessão de recuperação autorizada, atualiza a nova senha do usuário
            const { error: updateErr } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateErr) {
                throw updateErr;
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/area-do-filiado');
            }, 2200);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
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
                    <h2 className="text-2xl font-black text-slate-900">Senha Redefinida com Sucesso!</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Sua nova senha foi atualizada. Você será redirecionado para a página de login em instantes...
                    </p>
                    <Loader2 className="animate-spin mx-auto text-primary-600 mt-2" size={24} />
                    <div className="pt-2">
                        <Link 
                            to="/area-do-filiado" 
                            className="inline-block bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-primary-700 transition-colors text-xs shadow-xs"
                        >
                            Ir para o Login Agora &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                {step === 'request_code' ? (
                    <div>
                        <Link to="/area-do-filiado" className="flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-4 text-xs font-semibold">
                            <ArrowLeft size={16} className="mr-1" /> Voltar ao Login
                        </Link>
                        <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary-600">
                            <KeyRound size={32} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Recuperar Senha</h2>
                        <p className="text-sm text-gray-500">
                            Informe seu e-mail cadastrado para enviarmos um código de segurança numérico.
                        </p>

                        <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail Cadastrado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError(null);
                                            if (accountNotice) setAccountNotice(null);
                                        }}
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {/* Alerta de Primeiro Acesso ou Ativação Pendente com Link Direto */}
                            {accountNotice && (
                                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-950 space-y-3 animate-in fade-in duration-200 shadow-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                            {accountNotice.type === 'no_account' ? <KeyRound size={20} /> : <ShieldCheck size={20} />}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm text-amber-950">
                                                {accountNotice.type === 'no_account' ? 'Primeiro Acesso Necessário' : 'Conta Pendente de Ativação'}
                                            </h4>
                                            <p className="text-xs text-amber-900 leading-relaxed">
                                                {accountNotice.message}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/primeiro-acesso"
                                        state={{ email: accountNotice.email }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                                    >
                                        {accountNotice.type === 'no_account' ? 'Fazer Primeiro Acesso Agora' : 'Ativar Conta no Primeiro Acesso'} <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )}

                            {/* Erro padrão (ex: e-mail não cadastrado) */}
                            {error && (
                                <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-red-900 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
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
                                    'Enviar Código de Recuperação'
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary-600">
                            <ShieldCheck size={32} />
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 mb-2">
                            Redefinição de Senha
                        </span>
                        <h2 className="text-2xl font-black text-slate-900 mb-1">Digite o Código e a Nova Senha</h2>
                        <p className="text-xs text-slate-600 leading-relaxed mb-1">
                            Enviamos um código de segurança numérico para o e-mail:
                            <br />
                            <strong className="text-slate-900 font-mono text-sm">{email}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mb-6">
                            Verifique sua caixa de entrada e spam. Digite o código e defina sua nova senha abaixo:
                        </p>

                        <form className="space-y-4" onSubmit={handleResetWithOtp}>
                            {/* Campo Código OTP */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Segurança Recebido</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={8}
                                    autoFocus
                                    value={otpCode}
                                    onChange={(e) => {
                                        setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                                        if (error) setError(null);
                                    }}
                                    placeholder="Código numérico"
                                    className="w-full tracking-[0.2em] sm:tracking-[0.3em] text-center text-xl sm:text-2xl font-mono font-bold py-2.5 px-3 border-2 border-slate-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 rounded-xl outline-hidden text-slate-900 placeholder:text-slate-300"
                                />
                            </div>

                            {/* Campo Nova Senha */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Campo Confirmar Nova Senha */}
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
                                        placeholder="Repita a nova senha"
                                        className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200">
                                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {resendSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
                                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                    <span>{resendSuccess}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || otpCode.length < 6 || newPassword.length < 8}
                                className={`w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                                    otpCode.length >= 6 && newPassword.length >= 8 && !loading
                                        ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer shadow-md'
                                        : 'bg-slate-300 cursor-not-allowed text-slate-500'
                                }`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                                ) : (
                                    <>
                                        Redefinir Senha e Entrar <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <div className="pt-3 border-t border-slate-100 space-y-2 text-center">
                                <button
                                    type="button"
                                    disabled={isCoolingDown || resendLoading}
                                    onClick={handleResendCode}
                                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        isCoolingDown
                                            ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer'
                                    }`}
                                >
                                    {resendLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : isCoolingDown ? (
                                        <>
                                            <Clock size={14} />
                                            Reenviar código (aguarde {formattedTime})
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={14} />
                                            Não recebeu o código? Reenviar agora
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('request_code');
                                        setOtpCode('');
                                        setError(null);
                                        setAccountNotice(null);
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors"
                                >
                                    &larr; Informar outro e-mail
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
