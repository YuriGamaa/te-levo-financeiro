import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    UserPlus, 
    Trash2, 
    Edit, 
    Shield, 
    MapPin, 
    Mail, 
    Users as UsersIcon, 
    Loader2, 
    Search, 
    Wallet 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Franchise = {
    id: number;
    name: string;
};

type UserItem = {
    id: number;
    name: string;
    email: string;
    role: string;
    balance?: number; // Saldo do motorista
    franchise?: Franchise | null;
};

export default function Users() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');

        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);

            if (parsedUser.role !== 'admin' && parsedUser.role !== 'franchisee') {
                if (parsedUser.role === 'secretary') navigate('/daily-closing');
                else navigate('/financial');
                return;
            }

            setPageLoading(false);
            loadUsers();
        } else {
            navigate('/');
        }
    }, [navigate]);

    async function loadUsers() {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários', error);
            toast.error("Senhor Yuri, erro ao sincronizar a equipe.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Senhor Yuri, confirma a remoção deste membro da equipe?')) return;

        try {
            await api.delete(`/users/${id}`);
            toast.success("Usuário removido.");
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            toast.error('Erro ao excluir usuário.');
        }
    }

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleLabel = (role: string) => {
        const styles: Record<string, string> = {
            admin: "bg-red-100 text-red-800 border-red-200",
            franchisee: "bg-cyan-100 text-cyan-800 border-cyan-200",
            secretary: "bg-pink-100 text-pink-800 border-pink-200",
            employee: "bg-slate-100 text-slate-700 border-slate-200"
        };
        const labels: Record<string, string> = {
            admin: "Admin",
            franchisee: "Franqueado",
            secretary: "Secretária",
            employee: "Operacional"
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${styles[role] || styles.employee}`}>
                {role === 'admin' || role === 'franchisee' ? <Shield size={10} /> : null}
                {labels[role] || "Operacional"}
            </span>
        );
    };

    if (pageLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-cyan-700" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
            {/* Header com Busca */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-bold text-cyan-950 flex items-center justify-center lg:justify-start gap-2">
                        <UsersIcon className="text-cyan-600" /> Equipe & Motoristas
                    </h1>
                    <p className="text-slate-500 text-sm">Gestão de acessos e saldos Te Levo.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar por nome..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => navigate('/users/new')}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-cyan-950 hover:bg-cyan-900 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-950/20 font-bold text-sm transition-all"
                    >
                        <UserPlus size={18} /> Novo Usuário
                    </button>
                </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="p-5">Nome / Email</th>
                                <th className="p-5">Cargo</th>
                                <th className="p-5">Franquia</th>
                                <th className="p-5 text-right">Saldo Atual</th>
                                <th className="p-5 text-center">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-cyan-700" size={32} /></td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-cyan-50/30 transition-colors group">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-800 group-hover:text-cyan-900">{user.name}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Mail size={10} /> {user.email}
                                        </div>
                                    </td>

                                    <td className="p-5">{getRoleLabel(user.role)}</td>

                                    <td className="p-5">
                                        {user.franchise ? (
                                            <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                                <MapPin size={12} className="text-cyan-600" />
                                                {user.franchise.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 italic text-xs">Global / Matriz</span>
                                        )}
                                    </td>

                                    <td className="p-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-black text-sm ${(user.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {(user.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <span className="text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                                <Wallet size={8} /> Carteira
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/users/edit/${user.id}`)}
                                                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg transition-all"
                                                title="Editar Usuário"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                title="Excluir Usuário"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredUsers.length === 0 && (
                    <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                        <UsersIcon size={48} className="mb-4 opacity-10" />
                        <p className="font-medium">Nenhum membro encontrado com este nome.</p>
                    </div>
                )}
            </div>
        </div>
    );
}