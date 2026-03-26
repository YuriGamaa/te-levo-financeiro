import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, MapPin, Edit, Trash2, Building, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Franchises() {
    const navigate = useNavigate();
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFranchises();
    }, []);

    async function loadFranchises() {
        try {
            const response = await api.get('/franchises');
            setFranchises(response.data);
        } catch (error) {
            toast.error("Erro ao carregar unidades");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza que deseja excluir esta franquia? Isso apagará todos os dados vinculados a ela.")) return;

        try {
            await api.delete(`/franchises/${id}`);
            setFranchises(franchises.filter((f: any) => f.id !== id));
            toast.success("Franquia removida com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir. Verifique se existem dependências.");
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Unidades da Rede</h1>
                    <p className="text-slate-500">Gerencie e monitore o desempenho de cada cidade Te Levo.</p>
                </div>
                <button 
                    onClick={() => navigate('/franchise-create')} 
                    className="bg-cyan-950 hover:bg-cyan-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nova Unidade
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-cyan-700" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {franchises.map((franchise: any) => (
                        <div key={franchise.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-cyan-100 transition-all group overflow-hidden flex flex-col">
                            {/* Topo do Card */}
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl transition-colors ${franchise.is_matriz ? 'bg-cyan-900 text-white' : 'bg-cyan-50 text-cyan-700'}`}>
                                        <Building size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => navigate(`/franchise-edit/${franchise.id}`)}
                                            className="text-slate-400 hover:text-cyan-600 p-2 hover:bg-cyan-50 rounded-lg transition-all"
                                            title="Editar Unidade"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(franchise.id)}
                                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-800 mb-1">
                                    {franchise.name}
                                    {franchise.is_matriz && <span className="ml-2 text-[10px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">Matriz</span>}
                                </h3>
                                
                                <div className="flex items-center text-slate-500 text-sm mb-6">
                                    <MapPin size={14} className="mr-1" />
                                    {franchise.location || 'Localização não definida'}
                                </div>

                                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Mensal</span>
                                    <div className="text-lg font-black text-cyan-900">
                                        {parseFloat(franchise.investment_goal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            </div>

                            {/* Botão de Auditoria (Ação Principal) */}
                            <button 
                                onClick={() => navigate(`/dashboard?franchise_id=${franchise.id}`)}
                                className="w-full bg-slate-50 border-t border-slate-100 p-4 text-sm font-bold text-cyan-700 flex items-center justify-center gap-2 group-hover:bg-cyan-600 group-hover:text-white transition-all"
                            >
                                Auditar Financeiro <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}

                    {/* Estado Vazio */}
                    {franchises.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Building className="mx-auto h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">Nenhuma unidade cadastrada</h3>
                            <p className="text-slate-500 mb-8">Adicione as cidades da rede para começar o monitoramento.</p>
                            <button 
                                onClick={() => navigate('/franchise-create')}
                                className="bg-cyan-950 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                            >
                                Criar Primeira Franquia
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}