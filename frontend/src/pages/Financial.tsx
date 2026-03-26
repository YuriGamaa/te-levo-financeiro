import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Plus,
    ArrowUpCircle,
    ArrowDownCircle,
    Loader2,
    RefreshCw,
    Pencil,
    Trash2,
    List,
    TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Transaction = {
    id: number;
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense' | 'recharge';
    amount: string | number;
};

export default function Financial() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, []);

    async function loadTransactions() {
        try {
            setLoading(true);
            const response = await api.get('/transactions');
            const data = response.data.transactions ?? response.data;
            
            // ISOLAMENTO TOTAL: Esta tela ignora 'recharge' e categorias de balcão
            const admData = Array.isArray(data) 
                ? data.filter((t: Transaction) => 
                    t.type !== 'recharge' && 
                    t.category !== 'Recarga Motorista' &&
                    t.category !== 'Adesão' // Adesão operacional fica no Terminal
                )
                : [];
                
            setTransactions(admData);
        } catch (error) {
            toast.error("Senhor Yuri, erro ao carregar fluxo administrativo.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Confirmar exclusão desta movimentação administrativa?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Lançamento removido');
            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            toast.error('Erro ao excluir.');
        }
    }

    const formatMoney = (value: any) => {
        const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0 pb-10">
            {/* Header Administrativo */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
                        <TrendingUp className="text-cyan-600" size={28} /> Fluxo de Caixa Adm
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Lançamentos exclusivos da gestão Te Levo.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={loadTransactions} className="p-3 bg-slate-50 text-slate-400 hover:text-cyan-600 rounded-2xl transition-all">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    
                    <button onClick={() => navigate('/financial/new')} className="bg-cyan-950 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950/20">
                        <Plus size={20} /> Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Listagem Purificada */}
            <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Loader2 className="animate-spin text-cyan-600" size={40} />
                        <span className="font-bold animate-pulse uppercase text-xs tracking-widest">Sincronizando Matriz...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Administrativa</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor Líquido</th>
                                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gestão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length > 0 ? (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-cyan-50/20 transition-colors group">
                                            <td className="p-6 text-sm font-bold text-slate-400">
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 group-hover:text-cyan-900">{t.description}</span>
                                                    <span className="text-[9px] font-black text-cyan-600 uppercase tracking-tighter mt-1">{t.category}</span>
                                                </div>
                                            </td>
                                            <td className={`p-6 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+ ' : '- '}
                                                {formatMoney(t.amount)}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => navigate(`/financial/edit/${t.id}`)} className="p-2 text-slate-300 hover:text-cyan-600 transition-all"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-24 text-center">
                                            <List size={48} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhum registro administrativo</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}