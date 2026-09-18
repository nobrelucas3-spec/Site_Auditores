import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { 
    UserPlus, 
    ArrowLeft, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Mail, 
    Clock, 
    CheckCircle2 
} from 'lucide-react';
import { useEmailCooldown } from '../hooks/useEmailCooldown';

const FirstAccess: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [matricula, setMatricula] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const activeTargetEmail = email.trim() || alreadyRegisteredEmail || 'first_access';
    const { isCoolingDown, formattedTime, startCooldown } = useEmailCooldown(activeTargetEmail, 120);

    const handleResend = async () => {
        const target = (alreadyRegisteredEmail || email).trim();
        if (!target) return;
        setResendLoading(true);
        setResendSuccess(null);
        setError(null);

        try {
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
            setResendSuccess(`Novo e-mail de ativação enviado para ${target}! Verifique sua caixa de entrada e spam.`);
        } catch (err: any) {
            setError(err.message || 'Erro ao reenviar e-mail de ativação.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAlreadyRegisteredEmail(null);
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

            // 2. Criar cadastro no Supabase Auth
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

            if (signUpError) {
                const errLower = (signUpError.message || '').toLowerCase();
                if (errLower.includes('already registered') || errLower.includes('already exists')) {
                    setAlreadyRegisteredEmail(cleanEmail);
                    setLoading(false);
                    return;
                }
                throw signUpError;
            }

            // Tratamento de obfuscation do Supabase: se já registrado, identities vem vazio
            if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
                setAlreadyRegisteredEmail(cleanEmail);
                setLoading(false);
                return;
            }

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center space-y-5">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-800">Cadastro Realizado com Sucesso!</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Enviamos um link de ativação para o seu e-mail:
                            <br />
                            <strong className="text-slate-900">{email}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                            Por favor, verifique sua <strong>caixa de entrada</strong> e também a pasta de <strong>Spam / Lixo Eletrônico</strong>. Clique no link para ativar sua conta.
                        </p>
                    </div>

                    {resendSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                            <span>{resendSuccess}</span>
                        </div>
                    )}

                    <div className="pt-2 space-y-3">
                        <Link 
                            to="/area-do-filiado" 
                            className="w-full inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors shadow-xs text-sm"
                        >
                            Ir para a Página de Login
                        </Link>

                        <div className="pt-3 border-t border-slate-100">
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
                                        Reenviar e-mail de ativação (aguarde {formattedTime})
                                    </>
                                ) : (
                                    <>
                                        <Mail size={14} />
                                        Não recebeu o e-mail? Reenviar link agora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
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

                {/* Alerta se o usuário já estiver cadastrado */}
                {alreadyRegisteredEmail && (
                    <div className="rounded-2xl bg-amber-50 p-5 border border-amber-200 text-amber-950 space-y-3.5 animate-in fade-in duration-200">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                                <Mail size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-amber-950">
                                    Você já realizou o cadastro inicial!
                                </h4>
                                <p className="text-xs text-amber-900 leading-relaxed">
                                    Identificamos que já existe uma conta criada para <strong>{alreadyRegisteredEmail}</strong>.
                                </p>
                                <p className="text-xs text-amber-800">
                                    Se você já ativou sua conta pelo link recebido por e-mail, basta acessar com sua senha na página de login. Se ainda não confirmou ou o link expirou, solicite um novo envio abaixo:
                                </p>
                            </div>
                        </div>

                        {resendSuccess && (
                            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                                <span>{resendSuccess}</span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <button
                                type="button"
                                disabled={resendLoading || isCoolingDown}
                                onClick={handleResend}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
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
                                        Reenviar e-mail (aguarde {formattedTime})
                                    </>
                                ) : (
                                    <>
                                        <Mail size={15} />
                                        Reenviar E-mail de Ativação
                                    </>
                                )}
                            </button>
                            <Link
                                to="/area-do-filiado"
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-center flex items-center justify-center transition-colors shadow-2xs"
                            >
                                Ir para a Página de Login &rarr;
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
