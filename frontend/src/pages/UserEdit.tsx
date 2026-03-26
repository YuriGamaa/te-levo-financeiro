import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // <--- Verifique se isso está aqui!
import api from '../services/api';
import { 
    Save, 
    ArrowLeft, 
    User, 
    Mail, 
    Shield, 
    MapPin, 
    Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UserEdit() {
    const { id } = useParams(); // Captura o "1" da URL
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [franchiseId, setFranchiseId] = useState<number | string>('');
    
    const [franchises, setFranchises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadInitialData() {
            if (!id) return; // Se não tiver ID, nem tenta
            
            try {
                // 1. Carrega as Franquias primeiro
                const resFranchises = await api.get('/franchises');
                setFranchises(Array.isArray(resFranchises.data) ? resFranchises.data : []);

                // 2. Carrega o Usuário
                const resUser = await api.get(`/users/${id}`);
                const u = resUser.data;
                
                if (u) {
                    setName(u.name || '');
                    setEmail(u.email || '');
                    setRole(u.role || 'employee');
                    setFranchiseId(u.franchise_id || '');
                }
            } catch (error) {
                console.error("Erro no UserEdit:", error);
                toast.error("Erro ao carregar dados do usuário.");
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/users/${id}`, {
                name,
                email,
                role,
                franchise_id: franchiseId === '' ? null : Number(franchiseId)
            });
            toast.success("Usuário atualizado!");
            navigate('/users');
        } catch (error) {
            toast.error("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-cyan-700" size={40} />
            <span className="ml-2 text-slate-500 font-medium">Carregando Perfil...</span>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-slate-500 hover:text-cyan-700 mb-6 font-bold">
                <ArrowLeft size={20} /> Voltar
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-cyan-950 p-8 text-white">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <User className="text-cyan-400" /> Editar Usuário #{id}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">Nome</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-600" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400">E-mail</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Cargo</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                                <option value="admin">Admin</option>
                                <option value="franchisee">Franqueado</option>
                                <option value="secretary">Secretária</option>
                                <option value="employee">Motorista</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Franquia</label>
                            <select value={franchiseId} onChange={e => setFranchiseId(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none">
                                <option value="">Global</option>
                                {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <button disabled={saving} type="submit" className="w-full bg-cyan-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Salvar</>}
                    </button>
                </form>
            </div>
        </div>
    );
}