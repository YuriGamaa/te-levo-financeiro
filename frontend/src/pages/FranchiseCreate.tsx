import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Target, Building, ArrowLeft } from 'lucide-react';

export default function FranchiseCreate() {
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [investmentGoal, setInvestmentGoal] = useState('50000'); // Padrão 50k

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await api.post('/franchises', {
                name,
                location,
                investment_goal: parseFloat(investmentGoal)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Franquia criada com sucesso!');
            navigate('/franchises');
        } catch (error) {
            console.error("Erro ao criar franquia", error);
            alert('Erro ao criar franquia. Verifique os dados.');
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Botão Voltar */}
            <button 
                onClick={() => navigate('/franchises')}
                className="flex items-center text-gray-500 hover:text-purple-700 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Voltar para Lista
            </button>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 p-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Building className="text-purple-400" /> Nova Unidade Te Levo
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Cadastre uma nova cidade para operação.</p>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    
                    {/* Nome da Unidade */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Nome da Unidade</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Te Levo Poços de Caldas"
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Localização */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Localização (Cidade/UF)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Ex: Poços de Caldas - MG"
                                className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Meta de Investimento (Importante para o Dashboard) */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Meta de Investimento Inicial (R$)</label>
                        <div className="relative">
                            <Target className="absolute left-3 top-3 text-green-600" size={20} />
                            <input 
                                type="number" 
                                className="w-full border-2 border-green-100 bg-green-50 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-green-800"
                                value={investmentGoal}
                                onChange={e => setInvestmentGoal(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Este valor define a barra de progresso no Dashboard da franquia.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105">
                            Salvar Franquia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}