import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, Shield, ArrowLeft, Mail, Lock, User, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserCreate() {
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); 
    const [franchiseId, setFranchiseId] = useState('');
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/franchises')
            .then(res => setFranchises(res.data))
            .catch(() => toast.error("Erro ao carregar cidades."));
    }, []);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        
        if (role !== 'admin' && !franchiseId) {
            return toast.error("Senhor Yuri, selecione uma franquia para este usuário.");
        }

        setLoading(true);

        try {
            await api.post('/users', {
                name,
                email,
                password,
                role,
                franchise_id: role === 'admin' ? null : Number(franchiseId)
            });
            
            toast.success('Novo membro cadastrado na equipe!');
            navigate('/users');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Erro ao conectar com o servidor.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    const RoleButton = ({ value, label, colorClass, icon: Icon }: any) => (
        <button
            type="button"
            onClick={() => setRole(value)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                role === value 
                ? `${colorClass} border-transparent shadow-lg scale-105` 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
            }`}
        >
            <Icon size={24} className="mb-2" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 pb-10">
            <button 
                onClick={() => navigate('/users')}
                className="flex items-center gap-2 text-slate-500 hover:text-cyan-700 mb-6 font-bold transition-colors"
            >
                <ArrowLeft size={20} /> Voltar para Equipe
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-cyan-950 p-8 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="text-cyan-400" /> Novo Membro
                    </h2>
                    <p className="text-cyan-200/60 text-sm mt-1">Expanda a operação do Grupo Te Levo.</p>
                </div>

                <form onSubmit={handleRegister} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-600 outline-none"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    placeholder="Ex: Ana Silva"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">E-mail de Acesso</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="email" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-600 outline-none"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="ana@televo.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Senha Inicial</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-600 outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nível de Acesso</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <RoleButton value="employee" label="Motorista" colorClass="bg-slate-800 text-white" icon={User} />
                            <RoleButton value="secretary" label="Secretária" colorClass="bg-pink-600 text-white" icon={UserPlus} />
                            <RoleButton value="franchisee" label="Franqueado" colorClass="bg-cyan-600 text-white" icon={Shield} />
                            <RoleButton value="admin" label="Matriz" colorClass="bg-red-600 text-white" icon={Shield} />
                        </div>
                    </div>

                    {role !== 'admin' && (
                        <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-cyan-800 font-bold text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                                <MapPin size={16}/> Vincular à Cidade
                            </label>
                            <select 
                                className="w-full border border-cyan-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-cyan-500 font-bold text-slate-700"
                                value={franchiseId}
                                onChange={e => setFranchiseId(e.target.value)}
                                required
                            >
                                <option value="">-- Selecione a Unidade --</option>
                                {franchises.map((f: any) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-cyan-700 text-white p-4 rounded-2xl font-black shadow-xl shadow-cyan-900/20 hover:bg-cyan-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Cadastro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}