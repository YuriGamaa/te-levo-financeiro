import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import logoTeLevo from '../assets/logo.webp';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                email: email.trim(),
                password,
            };

            const response = await api.post('/login', payload);

            const { token, user } = response.data ?? {};

            if (!token || !user) {
                throw new Error('Resposta de login inválida.');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            const role = user.role;

            if (role === 'secretary') {
                navigate('/daily-closing');
            } else if (role === 'employee') {
                navigate('/financial');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Erro no login:', err?.response?.data || err);

            const rawData = err?.response?.data;
            let backendMessage = '';

            if (typeof rawData === 'string') {
                backendMessage = rawData;
            } else {
                backendMessage =
                    rawData?.message ||
                    rawData?.error ||
                    '';
            }

            if (
                err?.response?.status === 401 ||
                backendMessage.toLowerCase().includes('credenciais')
            ) {
                setError('Credenciais inválidas. Verifique seu acesso.');
            } else if (err?.response?.status === 422) {
                setError('Preencha corretamente e-mail e senha.');
            } else if (err?.code === 'ERR_NETWORK') {
                setError('Não foi possível conectar à API.');
            } else {
                setError('Erro ao entrar no sistema. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex w-full bg-white">
            <div className="hidden lg:flex w-1/2 bg-cyan-950 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-cyan-900 opacity-95"></div>

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

                <div className="relative z-10 text-center px-12 text-white">
                    <div className="mb-8 inline-flex p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
                        <img
                            src={logoTeLevo}
                            alt="Logo Te Levo"
                            className="h-24 w-auto object-contain drop-shadow-xl"
                        />
                    </div>

                    <h1 className="text-4xl font-bold mb-4 tracking-tight text-white">
                        Seu destino é o nosso compromisso.
                    </h1>

                    <p className="text-lg text-cyan-100/80 font-light max-w-md mx-auto leading-relaxed">
                        Painel Administrativo & Gestão de Franquias
                    </p>

                    <div className="mt-12 flex items-center justify-center gap-2 text-xs text-cyan-400/80 uppercase tracking-widest border border-cyan-500/30 py-2 px-4 rounded-full bg-cyan-900/40 w-fit mx-auto">
                        <ShieldCheck size={14} /> Sistema Seguro Te Levo
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-800">Login</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Acesse sua conta para gerenciar a frota.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                            <ShieldCheck className="text-red-500" size={20} />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-5">
                            <div className="group">
                                <label
                                    htmlFor="email"
                                    className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block group-focus-within:text-cyan-700 transition-colors"
                                >
                                    E-mail
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-700 transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all bg-gray-50 focus:bg-white"
                                        placeholder="nome@televo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block group-focus-within:text-cyan-700 transition-colors"
                                >
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-700 transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                                    Lembrar-me
                                </label>
                            </div>

                            <a href="#" className="font-medium text-cyan-700 hover:text-cyan-600 transition-colors">
                                Recuperar senha
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-900/10 text-sm font-bold text-white bg-cyan-700 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar no Sistema <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        &copy; 2026 Te Levo Mobile.
                    </p>
                </div>
            </div>
        </div>
    );
}