import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Loader2, 
    Wallet, 
    Briefcase 
} from 'lucide-react';

type Transaction = {
    id: number;
    amount: string | number;
    type: 'income' | 'expense' | 'recharge';
    category: string;
    date: string;
};

type Franchise = {
    id: number;
    name: string;
    investment_goal?: string | number;
};

type User = {
    name: string;
    role: string;
    franchise_id: number;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedFranchiseId = searchParams.get('franchise_id');

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [balance, setBalance] = useState(0);
    const [marketingSpent, setMarketingSpent] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [rechargeVolume, setRechargeVolume] = useState(0);

    const processarFinanceiro = useCallback((lista: Transaction[]) => {
        let admIncome = 0; let admExpense = 0; let recVol = 0; let mkt = 0;

        lista.forEach((t) => {
            const valor = parseFloat(String(t.amount));
            const isRecarga = t.type === 'recharge' || t.category === 'Recarga Motorista';
            const isAdesaoBalcao = t.category === 'Adesão';

            if (isRecarga) {
                recVol += valor;
            } else if (t.type === 'income' && !isAdesaoBalcao) {
                admIncome += valor;
            } else if (t.type === 'expense') {
                admExpense += valor;
                if (t.category === 'marketing') mkt += valor;
            }
        });

        setIncome(admIncome);
        setExpense(admExpense);
        setRechargeVolume(recVol);
        setMarketingSpent(mkt);
        setBalance(admIncome - admExpense);
    }, []);

    const loadData = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const fId = selectedFranchiseId || currentUser.franchise_id;
            const resTrans = await api.get(`/transactions?franchise_id=${fId}`);
            const lista = resTrans.data.transactions || resTrans.data;
            
            const filteredForGraph = lista.filter((t: Transaction) => t.type !== 'recharge' && t.category !== 'Recarga Motorista');
            
            setTransactions(filteredForGraph);
            processarFinanceiro(lista);

            const resFranchise = await api.get(`/franchises/${fId}`);
            setFranchise(resFranchise.data);
        } catch (error) {
            console.error('Erro dashboard', error);
        } finally {
            setLoading(false);
        }
    }, [selectedFranchiseId, processarFinanceiro]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.role === 'secretary') { navigate('/daily-closing'); return; }
            if (parsedUser.role === 'employee') { navigate('/financial'); return; }
            loadData(parsedUser);
        } else { navigate('/'); }
    }, [navigate, loadData]);

    const meta = franchise ? parseFloat(String(franchise.investment_goal || 50000)) : 50000;
    const porcentagemMkt = Math.min((marketingSpent / meta) * 100, 100);

    const dadosGrafico = [...transactions].reverse().map((t) => ({
        data: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: parseFloat(String(t.amount)),
    }));

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-cyan-700" size={40} /></div>;

    return (
        <div className="w-full space-y-4 md:space-y-8 pb-10">
            
            {/* Card Principal - Ajustado para empilhar no mobile */}
            <div className="bg-cyan-950 text-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 border border-white/10">
                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-black mb-1">
                        {selectedFranchiseId ? `Auditoria: ${franchise?.name}` : `Faturamento TeLevo`}
                    </h1>
                    <p className="text-cyan-400 font-bold uppercase text-[10px] tracking-widest">Visão Geral da Matriz</p>
                </div>

                <div className="relative z-10 w-full md:w-auto text-center md:text-right bg-white/10 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-widest text-cyan-300 font-black mb-1">Lucro Líquido Operacional</p>
                    <p className={`text-2xl md:text-4xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* Grid de Cards - 1 coluna no mobile, 2 em tablets, 4 em desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Receita Real (ADM)</span>
                    <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="text-emerald-500" size={20} />
                        <h3 className="text-lg md:text-xl font-black text-slate-800">{income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Despesa Fixa/Variável</span>
                    <div className="flex items-center gap-2 mt-1">
                        <TrendingDown className="text-red-500" size={20} />
                        <h3 className="text-lg md:text-xl font-black text-slate-800">{expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-blue-100 shadow-sm">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Volume de Balcão</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Wallet className="text-blue-500" size={20} />
                        <h3 className="text-lg md:text-xl font-black text-blue-900">{rechargeVolume.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                    </div>
                </div>

                <div className="bg-cyan-900 text-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-lg relative overflow-hidden border border-cyan-800">
                    <p className="text-[10px] text-cyan-400 font-black uppercase mb-1">Mkt Investido</p>
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg md:text-xl font-black">{marketingSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                        <span className="text-[10px] font-black text-cyan-300">{porcentagemMkt.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full transition-all duration-1000" style={{ width: `${porcentagemMkt}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Gráfico - Altura reduzida no mobile para melhor visualização */}
            <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600"><Briefcase size={18} /></div>
                    <h3 className="text-base md:text-lg font-black text-slate-700">Fluxo de Lucratividade</h3>
                </div>
                <div className="h-[250px] md:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dadosGrafico}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                            <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="valor" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}