import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
    UserPlus, 
    ArrowLeft, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Mail, 
    Clock, 
    CheckCircle2,
    ShieldCheck,
    ArrowRight,
    KeyRound
} from 'lucide-react';
import { useEmailCooldown } from '../hooks/useEmailCooldown';

const FirstAccess: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState((location.state?.email as string) || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [matricula, setMatricula] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [alreadyActiveAccountEmail, setAlreadyActiveAccountEmail] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const navigate = useNavigate();

    const activeTargetEmail = email.trim() || 'first_access';
    const { isCoolingDown, formattedTime, startCooldown } = useEmailCooldown(activeTargetEmail, 120);

    const handleResend = async () => {
        const target = email.trim();
        if (!target) return;
        setResendLoading(true);
        setResendSuccess(null);
        setError(null);
        setVerifyError(null);

        try {
            // Verificar se o e-mail pertence a um associado ativo
            const { data: member, error: memberErr } = await supabase
                .from('members')
                .select('id, status, is_associado, is_filiado')
                .or(`email.ilike.${target},email_institutional.ilike.${target},email_personal.ilike.${target}`)
                .maybeSingle();

            if (memberErr || !member) {
                throw new Error('E-mail não encontrado no cadastro de associados.');
            }

            if (member.status !== 'active' || (!member.is_associado && !member.is_filiado)) {
                throw new Error('Cadastro não autorizado ou inativo.');
            }

            const { error: resendErr } = await supabase.auth.resend({
                type: 'signup',
                email: target,
                options: {
                    emailRedirectTo: `${window.location.origin}/#/area-do-filiado`
                }
            });

            if (resendErr) {
                const msgLower = (resendErr.message || '').toLowerCase();
                if (msgLower.includes('rate limit') || msgLower.includes('too many')) {
                    throw new Error('Limite temporário de envios atingido. Aguarde alguns instantes antes de tentar novamente.');
                }
                throw resendErr;
            }

            startCooldown(120);
            setResendSuccess(`Novo código enviado para ${target}! Verifique sua caixa de entrada.`);
        } catch (err: any) {
            setError(err.message || 'Erro ao reenviar código de ativação.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleVerifyOtp = async (targetEmailOverride?: string) => {
        const targetEmail = (targetEmailOverride || email).trim();
        const cleanToken = otpCode.replace(/\D/g, '').trim();

        if (cleanToken.length < 6 || cleanToken.length > 8) {
            setVerifyError('Por favor, digite o código completo recebido no e-mail.');
            return;
        }

        setVerifyLoading(true);
        setVerifyError(null);

        try {
            let { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
                email: targetEmail,
                token: cleanToken,
                type: 'signup'
            });

            if (verifyErr) {
                const msgLower = (verifyErr.message || '').toLowerCase();
                if (msgLower.includes('type') || msgLower.includes('invalid token')) {
                    // Fallback para type email caso configurado assim no Supabase
                    const fallback = await supabase.auth.verifyOtp({
                        email: targetEmail,
                        token: cleanToken,
                        type: 'email'
                    });
                    if (!fallback.error) {
                        verifyData = fallback.data;
                        verifyErr = null;
                    }
                }
            }

            if (verifyErr) {
                throw new Error('Código de confirmação inválido ou expirado. Verifique o número digitado ou solicite um novo envio.');
            }

            setVerifySuccess(true);
            setTimeout(() => {
                navigate('/area-do-filiado/dashboard');
            }, 1800);
        } catch (err: any) {
            setVerifyError(err.message || 'Erro ao validar código. Tente novamente.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAlreadyActiveAccountEmail(null);
        setResendSuccess(null);

        const cleanEmail = email.trim();
        const cleanMatricula = matricula.trim();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres.');
            setLoading(false);
            return;
        }

        try {
            // 1. Verificar se a matrícula e o e-mail existem na base de membros
            const { data: memberData, error: memberError } = await supabase
                .from('members')
                .select('*')
                .eq('matricula', cleanMatricula)
                .or(`email.ilike.${cleanEmail},email_institutional.ilike.${cleanEmail},email_personal.ilike.${cleanEmail}`)
                .maybeSingle();

            if (memberError || !memberData) {
                setError('Dados não encontrados. Verifique se o E-mail e Matrícula conferem com seu cadastro na associação.');
                setLoading(false);
                return;
            }

            // Se o e-mail usado for diferente do principal, atualiza o principal
            if (memberData.email !== cleanEmail) {
                const { error: updateEmailError } = await supabase
                    .from('members')
                    .update({ email: cleanEmail })
                    .eq('id', memberData.id);
                
                if (updateEmailError) throw updateEmailError;
            }

            if (memberData.status !== 'active') {
                setError('Seu cadastro consta como inativo. Entre em contato com a associação para regularizar sua situação.');
                setLoading(false);
                return;
            }

            if (!memberData.is_associado && !memberData.is_filiado) {
                setError('Para criar o acesso, é necessário ser associado ou filiado ativo.');
                setLoading(false);
                return;
            }

            // 2. Tentar criar cadastro no Supabase Auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/#/area-do-filiado`,
                    data: {
                        full_name: memberData.full_name,
                        matricula: memberData.matricula,
                        is_associado: memberData.is_associado,
                        is_filiado: memberData.is_filiado
                    }
                }
            });

            const isExistingUser = 
                (signUpError && (
                    (signUpError.message || '').toLowerCase().includes('already registered') ||
                    (signUpError.message || '').toLowerCase().includes('already exists')
                )) ||
                (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0);

            if (isExistingUser) {
                // Testar se a conta existente já está ativada ou pendente de ativação
                const { data: testSignData, error: testSignErr } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: password,
                });

                // Se o Supabase retornou "Email not confirmed", a conta AINDA NÃO está ativada
                const isUnconfirmed = testSignErr && (testSignErr.message || '').toLowerCase().includes('email not confirmed');

                if (isUnconfirmed) {
                    // CONTA NÃO ATIVADA:
                    // Dispara o envio do código de confirmação e avança diretamente para a tela de ativação
                    await supabase.auth.resend({
                        type: 'signup',
                        email: cleanEmail,
                        options: {
                            emailRedirectTo: `${window.location.origin}/#/area-do-filiado`
                        }
                    });

                    startCooldown(120);
                    setSuccess(true);
                    setLoading(false);
                    return;
                }

                // Se a conta não é unconfirmed, ela JÁ ESTÁ ATIVADA!
                if (testSignData?.session) {
                    await supabase.auth.signOut();
                }

                // Exibe aviso claro de conta já ativada com link para redefinir senha
                setAlreadyActiveAccountEmail(cleanEmail);
                setLoading(false);
                return;
            }

            if (signUpError) {
                throw signUpError;
            }

            // Conta nova: código OTP enviado automaticamente pelo Supabase
            setSuccess(true);
            startCooldown(120);
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center space-y-6 relative z-10">
                    {verifySuccess ? (
                        <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-200">
                            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle size={36} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Conta Ativada com Sucesso!</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Seu código de acesso foi validado. Redirecionando para o portal do associado...
                            </p>
                            <Loader2 className="animate-spin mx-auto text-primary-600 mt-2" size={24} />
                        </div>
                    ) : (
                        <>
                            <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary-600">
                                <ShieldCheck size={36} />
                            </div>

                            <div className="space-y-2">
                                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800">
                                    Ativação de Acesso
                                </span>
                                <h2 className="text-2xl font-black text-slate-900">Digite o Código de Confirmação</h2>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Enviamos um código de segurança numérico para o seu e-mail:
                                    <br />
                                    <strong className="text-slate-900 font-mono text-sm">{email}</strong>
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Localize o e-mail da Associação (verifique também a pasta de <strong>Spam</strong>) e digite o código numérico abaixo:
                                </p>
                            </div>

                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleVerifyOtp();
                                }} 
                                className="space-y-4"
                            >
                                <div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={8}
                                        autoFocus
                                        value={otpCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                            setOtpCode(val);
                                            if (verifyError) setVerifyError(null);
                                        }}
                                        placeholder="Código numérico"
                                        className="w-full tracking-[0.2em] sm:tracking-[0.3em] text-center text-2xl sm:text-3xl font-mono font-black py-3 px-4 border-2 border-slate-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 rounded-xl outline-hidden text-slate-900 placeholder:text-slate-300 transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Insira os dígitos numéricos recebidos por e-mail
                                    </p>
                                </div>

                                {verifyError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 text-left animate-in fade-in">
                                        <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                        <span>{verifyError}</span>
                                    </div>
                                )}

                                {resendSuccess && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-center gap-2 animate-in fade-in">
                                        <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                        <span>{resendSuccess}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={verifyLoading || otpCode.length < 6}
                                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                                        otpCode.length >= 6 && !verifyLoading
                                            ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer shadow-md'
                                            : 'bg-slate-300 cursor-not-allowed text-slate-500'
                                    }`}
                                >
                                    {verifyLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            Ativar Conta e Entrar <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="pt-3 border-t border-slate-100 space-y-2">
                                <button
                                    type="button"
                                    disabled={isCoolingDown || resendLoading}
                                    onClick={handleResend}
                                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        isCoolingDown
                                            ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
                                        setSuccess(false);
                                        setOtpCode('');
                                        setVerifyError(null);
                                    }}
                                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    &larr; Corrigir e-mail ou dados informados
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                <div>
                    <Link to="/area-do-filiado" className="flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-4">
                        <ArrowLeft size={16} className="mr-1" /> Voltar
                    </Link>
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-primary-600">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Primeiro Acesso</h2>
                    <p className="text-sm text-gray-500">
                        Confirme seus dados para criar sua conta de acesso.
                    </p>
                </div>

                {/* Alerta se o usuário já possuir conta ativa */}
                {alreadyActiveAccountEmail && (
                    <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200 text-amber-950 space-y-3.5 animate-in fade-in duration-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-amber-950">
                                    Você já possui cadastro ativo!
                                </h4>
                                <p className="text-xs text-amber-900 leading-relaxed">
                                    Identificamos que seu acesso para o e-mail <strong>{alreadyActiveAccountEmail}</strong> já foi criado e ativado anteriormente. Não é necessário realizar o primeiro acesso novamente.
                                </p>
                                <p className="text-xs text-amber-800">
                                    Caso você tenha esquecido sua senha, utilize a redefinição de senha abaixo:
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-amber-200/60">
                            <button
                                type="button"
                                onClick={() => navigate('/esqueci-senha', { state: { email: alreadyActiveAccountEmail } })}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <KeyRound size={15} />
                                Esqueceu a senha? Redefinir
                            </button>
                            <Link
                                to="/area-do-filiado"
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-center flex items-center justify-center transition-colors shadow-2xs"
                            >
                                Ir para o Login &rarr;
                            </Link>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                            <input
                                id="matricula"
                                name="matricula"
                                type="text"
                                required
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                placeholder="Digite sua matrícula sem pontos"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail Cadastrado</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                placeholder="Seu e-mail cadastrado na associação"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Crie uma Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirme a Senha</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                                placeholder="Repita a senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-100">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 text-white" />
                        ) : (
                            'Criar Conta'
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        Caso não tenha e-mail cadastrado ou encontre dificuldades, entre em contato com o suporte.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default FirstAccess;
