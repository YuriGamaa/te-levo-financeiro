import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FinancialEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Outros',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        async function loadTransaction() {
            try {
                const response = await api.get(`/transactions`);
                // Como o index retorna um array, filtramos o ID específico
                const data = response.data.transactions || response.data;
                const transaction = data.find((t: any) => t.id === Number(id));

                if (transaction) {
                    setFormData({
                        description: transaction.description,
                        amount: transaction.amount,
                        type: transaction.type,
                        category: transaction.category,
                        date: transaction.date.split('T')[0]
                    });
                }
            } catch (error) {
                toast.error("Erro ao carregar dados do lançamento");
                navigate('/financial');
            } finally {
                setLoading(false);
            }
        }
        loadTransaction();
    }, [id, navigate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/transactions/${id}`, formData);
            toast.success('Lançamento atualizado com sucesso!');
            navigate('/financial');
        } catch (error) {
            toast.error('Erro ao atualizar lançamento');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-cyan-700" size={40} />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => navigate('/financial')} className="flex items-center gap-2 text-slate-500 hover:text-cyan-700 transition-colors">
                <ArrowLeft size={20} /> Voltar
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar Lançamento</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-600 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-600 outline-none"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-600 outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                            >
                                <option value="income">Entrada</option>
                                <option value="expense">Saída</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Data</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-600 outline-none"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-cyan-950 hover:bg-cyan-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Salvar Alterações
                    </button>
                </form>
            </div>
        </div>
    );
}