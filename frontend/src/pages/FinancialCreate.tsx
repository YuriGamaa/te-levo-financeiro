import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { DollarSign, ArrowLeft, Save, TrendingUp, TrendingDown, Wallet, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

type UserOption = {
    id: number;
    name: string;
};

export default function FinancialCreate() {
    const navigate = useNavigate();
    
    // Estados do Formulário
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'recharge'>('income');
    const [category, setCategory] = useState('sales');
    const [userId, setUserId] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [users, setUsers] = useState<UserOption[]>([]);

    // Carrega usuários para vincular a recarga
    useEffect(() => {
        async function loadUsers() {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Erro ao carregar usuários", error);
            }
        }
        loadUsers();
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        
        // Validação extra para recargas
        if (type === 'recharge' && !userId) {
            return toast.error("Senhor Yuri, selecione o motorista para esta recarga.");
        }

        try {
            await api.post('/transactions', {
                description,
                amount: parseFloat(amount),
                type,
                category: type === 'recharge' ? 'recarga' : category,
                user_id: type === 'recharge' ? userId : null,
                date
            });
            
            toast.success('Lançamento registrado com sucesso!');
            navigate(type === 'recharge' ? '/recargas' : '/financial');
        } catch (error) {
            toast.error('Erro ao salvar lançamento no banco.');
        }
    }

    // Cor dinâmica baseada no tipo
    const getHeaderColor = () => {
        if (type === 'income') return 'bg-emerald-600';
        if (type === 'expense') return 'bg-red-600';
        return 'bg-blue-600'; // Cor para Recarga
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-cyan-700 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} className="mr-2" /> Voltar
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className={`${getHeaderColor()} p-8 text-white transition-colors duration-500`}>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign /> Novo Lançamento
                    </h2>
                    <p className="opacity-80 text-sm mt-1">Gestão financeira Te Levo.</p>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    
                    {/* SELETOR DE TIPO (Entrada vs Saída vs Recarga) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all text-xs ${
                                type === 'income' 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                : 'border-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            <TrendingUp size={16} /> Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all text-xs ${
                                type === 'expense' 
                                ? 'border-red-500 bg-red-50 text-red-700' 
                                : 'border-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            <TrendingDown size={16} /> Saída
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('recharge')}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all text-xs ${
                                type === 'recharge' 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-slate-50 text-slate-400 hover:border-slate-200'
                            }`}
                        >
                            <Wallet size={16} /> Recarga
                        </button>
                    </div>

                    {/* Vínculo de Usuário (Apenas para Recargas) */}
                    {type === 'recharge' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-slate-700 font-bold mb-2 flex items-center gap-2">
                                <User size={18} className="text-blue-600" /> Selecionar Motorista
                            </label>
                            <select 
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50 font-medium"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                required
                            >
                                <option value="">Escolha o motorista...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-700 font-bold mb-2">Descrição</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">Valor (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none font-bold"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">Data</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {type !== 'recharge' && (
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">Categoria</label>
                            <select 
                                className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none bg-white"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="sales">Vendas / Receita</option>
                                <option value="marketing">Marketing</option>
                                <option value="operational">Operacional</option>
                                <option value="personnel">Pessoal</option>
                                <option value="taxes">Impostos / Taxas</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-6">
                        <button type="submit" className="w-full bg-cyan-950 hover:bg-cyan-900 text-white p-4 rounded-2xl font-bold shadow-lg shadow-cyan-950/20 transition-all flex items-center justify-center gap-2">
                            <Save size={20} /> Salvar Lançamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}