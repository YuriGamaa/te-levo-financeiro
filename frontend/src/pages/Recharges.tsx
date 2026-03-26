import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Plus,
    Wallet,
    Loader2,
    RefreshCw,
    Pencil,
    Trash2,
    User as UserIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Recharge = {
    id: number;
    date: string;
    description: string;
    amount: string | number;
    type: string;
    user?: { name: string }; // Para mostrar quem recebeu a recarga
};

export default function Recharges() {
    const navigate = useNavigate();
    const [recharges, setRecharges] = useState<Recharge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecharges();
    }, []);

    async function loadRecharges() {
        try {
            setLoading(true);
            // Buscamos todas, mas filtramos apenas recargas
            const response = await api.get('/transactions');
            const data = response.data.transactions ?? response.data;
            
            const onlyRecharges = Array.isArray(data) 
                ? data.filter((t: Recharge) => t.type === 'recharge')
                : [];
                
            setRecharges(onlyRecharges);
        } catch (error) {
            toast.error("Senhor Yuri, erro ao carregar as recargas.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Confirmar exclusão desta recarga? O saldo do motorista não será estornado automaticamente.')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Recarga removida');
            setRecharges(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error('Erro ao excluir.');
        }
    }

    const formatMoney = (value: any) => {
        const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
            <div className="flex flex-col md:row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <Wallet className="text-blue-600" /> Painel de Recargas
                    </h1>
                    <p className="text-slate-500 text-sm">Gerenciamento isolado de créditos para motoristas.</p>
                </div>

                <button onClick={() => navigate('/financial/new')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={20} /> Nova Recarga
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <span className="animate-pulse">Buscando recargas...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Data</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Motorista</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                    <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recharges.map((r) => (
                                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-5 text-sm text-slate-500">
                                            {new Date(r.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-5 font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <UserIcon size={14} />
                                            </div>
                                            {r.user?.name || 'Motorista não identificado'}
                                        </td>
                                        <td className="p-5 text-slate-600 italic text-sm">
                                            {r.description}
                                        </td>
                                        <td className="p-5 text-right font-black text-blue-700">
                                            {formatMoney(r.amount)}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => navigate(`/financial/edit/${r.id}`)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}