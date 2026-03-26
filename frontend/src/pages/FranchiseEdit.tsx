import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Target, Building, ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FranchiseEdit() {
    const { id } = useParams(); // Pega o ID da URL
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [investmentGoal, setInvestmentGoal] = useState('50000');
    const [isMatriz, setIsMatriz] = useState(false);

    useEffect(() => {
        loadFranchiseData();
    }, [id]);

    async function loadFranchiseData() {
        try {
            const response = await api.get(`/franchises/${id}`);
            const { name, location, investment_goal, is_matriz } = response.data;
            
            setName(name);
            setLocation(location || '');
            setInvestmentGoal(String(investment_goal || '50000'));
            setIsMatriz(!!is_matriz);
        } catch (error) {
            toast.error("Erro ao carregar dados da franquia");
            navigate('/franchises');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put(`/franchises/${id}`, {
                name,
                location,
                investment_goal: parseFloat(investmentGoal || '0'),
                is_matriz: isMatriz
            });

            toast.success('Franquia atualizada com sucesso!');
            navigate('/franchises');
        } catch (error) {
            console.error('Erro ao atualizar franquia', error);
            toast.error('Erro ao atualizar. Verifique os dados.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-cyan-700" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <button
                onClick={() => navigate('/franchises')}
                className="flex items-center text-slate-500 hover:text-cyan-700 mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} className="mr-2" />
                Voltar para Lista
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-cyan-950 p-8 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Building className="text-cyan-400" />
                        Configurações da Unidade
                    </h2>
                    <p className="text-cyan-100/60 text-sm mt-1">
                        Ajuste as metas e informações de localização da franquia.
                    </p>
                </div>

                <form onSubmit={handleUpdate} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-2 text-sm uppercase tracking-wide">
                                Nome da Unidade
                            </label>
                            <input
                                type="text"
                                className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-2 text-sm uppercase tracking-wide">
                                Localização
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none transition-all"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-2 text-sm uppercase tracking-wide">
                                Meta de Faturamento (R$)
                            </label>
                            <div className="relative">
                                <Target className="absolute left-3 top-3 text-cyan-600" size={20} />
                                <input
                                    type="number"
                                    className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-cyan-600 outline-none transition-all font-bold text-slate-800"
                                    value={investmentGoal}
                                    onChange={(e) => setInvestmentGoal(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                        <input 
                            type="checkbox" 
                            id="matriz"
                            className="w-5 h-5 accent-cyan-600 cursor-pointer"
                            checked={isMatriz}
                            onChange={(e) => setIsMatriz(e.target.checked)}
                        />
                        <label htmlFor="matriz" className="text-sm font-bold text-cyan-900 cursor-pointer">
                            Esta unidade é a Matriz (Caixa Principal do Admin)
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-cyan-900 hover:bg-cyan-800 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}