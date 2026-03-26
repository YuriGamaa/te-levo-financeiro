import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, MapPin, Users, Calculator, LogOut, PlusCircle, ClipboardList } from 'lucide-react';
import logoTeLevo from '../assets/logo.webp';

interface SidebarProps {
    user: any;
    onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
    const location = useLocation();
    const role = user?.role || 'employee';

    const isAdmin = role === 'admin';
    const isFranchisee = role === 'franchisee';
    const isOperational = role === 'employee';
    const isSecretary = role === 'secretary';

    const isActive = (path: string) =>
        location.pathname === path
            ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/40 border-l-4 border-cyan-300'
            : 'text-cyan-100/60 hover:bg-cyan-900/50 hover:text-white';

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-cyan-950 text-white flex flex-col z-50 border-r border-cyan-900 shadow-2xl">
            <div className="p-6 flex flex-col items-center border-b border-cyan-900 bg-cyan-950/50 backdrop-blur-sm">
                <div className="mb-4 p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <img
                        src={logoTeLevo}
                        alt="Te Levo"
                        className="h-12 w-auto object-contain brightness-0 invert"
                    />
                </div>

                <h1 className="text-xl font-bold tracking-tight text-white">Te Levo</h1>

                <div className="mt-2 text-center">
                    {isAdmin && (
                        <span className="text-[10px] font-bold bg-red-500/20 text-red-200 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
                            Matriz
                        </span>
                    )}
                    {isFranchisee && (
                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase">
                            Franqueado
                        </span>
                    )}
                    {isOperational && (
                        <span className="text-[10px] font-bold bg-slate-500/20 text-slate-200 border border-slate-500/30 px-2 py-0.5 rounded-full uppercase">
                            Operacional
                        </span>
                    )}
                    {isSecretary && (
                        <span className="text-[10px] font-bold bg-pink-500/20 text-pink-200 border border-pink-500/30 px-2 py-0.5 rounded-full uppercase">
                            Secretária
                        </span>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {(isSecretary || isFranchisee || isAdmin) && (
                    <>
                        <p className="px-4 text-xs font-bold text-cyan-500/50 uppercase tracking-wider mb-2 mt-2">
                            Balcão
                        </p>

                        <Link
                            to="/daily-closing"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/daily-closing')}`}
                        >
                            <ClipboardList size={20} />
                            <span>Lançamento de recargas</span>
                        </Link>
                    </>
                )}

                {(isOperational || isFranchisee || isAdmin) && (
                    <>
                        <p className="px-4 text-xs font-bold text-cyan-500/50 uppercase tracking-wider mb-2 mt-4">
                            Financeiro
                        </p>

                        <Link
                            to="/financial/new"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/financial/new')}`}
                        >
                            <PlusCircle size={20} />
                            <span>Novo Lançamento</span>
                        </Link>

                        <Link
                            to="/financial"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/financial')}`}
                        >
                            <Wallet size={20} />
                            <span>Fluxo de Caixa</span>
                        </Link>
                    </>
                )}

                {(isFranchisee || isAdmin) && (
                    <>
                        <p className="px-4 text-xs font-bold text-cyan-500/50 uppercase tracking-wider mb-2 mt-6">
                            Gestão
                        </p>

                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/dashboard')}`}
                        >
                            <LayoutDashboard size={20} />
                            <span>Visão Geral</span>
                        </Link>

                        <Link
                            to="/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/users')}`}
                        >
                            <Users size={20} />
                            <span>Equipe</span>
                        </Link>
                    </>
                )}

                {isAdmin && (
                    <>
                        <p className="px-4 text-xs font-bold text-cyan-500/50 uppercase tracking-wider mb-2 mt-6">
                            Sistema Central
                        </p>

                        <Link
                            to="/franchises"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/franchises')}`}
                        >
                            <MapPin size={20} />
                            <span>Franquias</span>
                        </Link>

                        <Link
                            to="/tech-fees"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive('/tech-fees')}`}
                        >
                            <Calculator size={20} />
                            <span>Demonstrativo</span> {/* Ajuste realizado aqui */}
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-cyan-900 bg-cyan-950">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-900/20 hover:bg-red-900/30 text-cyan-200 hover:text-red-400 py-2.5 rounded-xl transition-all font-medium text-sm"
                >
                    <LogOut size={16} />
                    Sair do Sistema
                </button>
            </div>
        </aside>
    );
}