import { useEffect, useState } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    PlusCircle,
    MinusCircle,
    FileText,
    FileSpreadsheet,
    Calendar,
    Coins,
    X,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Transaction = {
    id: number;
    description: string;
    amount: string | number;
    type: 'income' | 'expense' | 'recharge';
    category: string;
    date: string;
    user?: { name: string };
};

export default function DailyClosing() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ income: 0, expense: 0, recharge: 0, balance: 0 });
    const [users, setUsers] = useState<{id: number, name: string}[]>([]);

    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense' | 'recharge'>('income');
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Recarga Motorista');
    const [selectedUserId, setSelectedUserId] = useState('');

    useEffect(() => {
        loadDailyData();
        loadUsers();
    }, [selectedDate]);

    async function loadUsers() {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (e) { console.error(e); }
    }

    async function loadDailyData() {
        setLoading(true);
        try {
            const response = await api.get('/transactions');
            const all = response.data.transactions ?? response.data;
            
            // ISOLAMENTO: Filtra apenas o que é movimento operacional do balcão
            const daily = Array.isArray(all) 
                ? all.filter((t: Transaction) => 
                    String(t.date).startsWith(selectedDate) && 
                    (t.type === 'recharge' || t.category === 'Recarga Motorista' || t.category === 'Adesão')
                )
                : [];

            setTransactions(daily);
            calculateSummary(daily);
        } catch (error) {
            toast.error("Erro ao carregar terminal.");
        } finally {
            setLoading(false);
        }
    }

    function calculateSummary(data: Transaction[]) {
        let inc = 0, exp = 0, rec = 0;
        data.forEach((t) => {
            const val = parseFloat(String(t.amount));
            if (t.type === 'recharge') rec += val;
            else if (t.type === 'income') inc += val;
            else if (t.type === 'expense') exp += val;
        });
        setSummary({ income: inc, expense: exp, recharge: rec, balance: (inc + rec) - exp });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const finalType = (category === 'Recarga Motorista') ? 'recharge' : modalType;
            await api.post('/transactions', {
                description,
                amount: parseFloat(amount.replace(',', '.')),
                type: finalType,
                category: category,
                user_id: finalType === 'recharge' ? selectedUserId : null,
                date: selectedDate
            });
            toast.success("Lançamento confirmado!");
            setIsModalOpen(false);
            resetForm();
            await loadDailyData();
        } catch (error) {
            toast.error('Erro ao salvar no terminal.');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setDescription(''); setAmount(''); setCategory('Recarga Motorista'); setSelectedUserId('');
    }

    function handleExportCSV() {
        if (transactions.length === 0) return toast.error("Sem dados para exportar");
        const headers = ['Data', 'Descrição', 'Referência', 'Tipo', 'Valor'];
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('pt-BR'),
            t.description,
            t.user?.name || t.category,
            t.type.toUpperCase(),
            String(t.amount).replace('.', ',')
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Balcao-TeLevo-${selectedDate}.csv`;
        link.click();
    }

    function handleExportPDF() {
        if (transactions.length === 0) return toast.error("Sem dados para exportar");
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Relatório de Balcão - TeLevo`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Data: ${new Date(selectedDate).toLocaleDateString('pt-BR')}`, 14, 22);
        
        autoTable(doc, {
            head: [['Descrição', 'Referência', 'Tipo', 'Valor']],
            body: transactions.map(t => [t.description, t.user?.name || t.category, t.type.toUpperCase(), `R$ ${t.amount}`]),
            startY: 30,
            headStyles: { fillColor: [8, 51, 68] }
        });
        doc.save(`Terminal-${selectedDate}.pdf`);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 px-4 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-cyan-950 flex items-center gap-2">
                        <Coins className="text-blue-600" /> Terminal de Operações
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Controle isolado de balcão e recargas.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"><FileSpreadsheet size={16}/> Planilha</button>
                    <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"><FileText size={16}/> PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => { setModalType('income'); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[32px] shadow-xl shadow-blue-100 font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
                    <PlusCircle size={32} /> NOVA RECARGA
                </button>
                {/* CHECKLIST: Texto alterado de Sangria para Lançar Despesa */}
                <button onClick={() => { setModalType('expense'); setCategory('Despesa Operacional'); setIsModalOpen(true); }} className="bg-slate-800 hover:bg-slate-900 text-white p-6 rounded-[32px] shadow-xl shadow-slate-100 font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
                    <MinusCircle size={32} /> LANÇAR DESPESA
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-blue-600">Recargas</span>
                    <p className="text-2xl font-black text-slate-800">R$ {summary.recharge.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-emerald-600">Entradas</span>
                    <p className="text-2xl font-black text-slate-800">R$ {summary.income.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-red-600">Saídas</span>
                    <p className="text-2xl font-black text-slate-800">R$ {summary.expense.toFixed(2)}</p>
                </div>
                <div className="bg-cyan-950 p-6 rounded-[32px] text-white shadow-2xl">
                    <span className="text-[10px] font-black uppercase text-cyan-400">Saldo Terminal</span>
                    <p className="text-2xl font-black text-white">R$ {summary.balance.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                {loading ? <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b">
                                <tr><th className="px-6 py-5">Descrição</th><th className="px-6 py-5">Referência</th><th className="px-6 py-5 text-right">Valor</th><th className="px-6 py-5 text-center">Tipo</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 ? <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold">Sem movimentações operacionais hoje.</td></tr> : (
                                    transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">{t.description}</td>
                                            <td className="px-6 py-4"><span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">{t.user?.name || t.category}</span></td>
                                            <td className={`px-6 py-4 text-right font-black ${t.type === 'expense' ? 'text-red-500' : (t.type === 'recharge' ? 'text-blue-600' : 'text-emerald-600')}`}>R$ {parseFloat(String(t.amount)).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${t.type === 'recharge' ? 'bg-blue-100 text-blue-700' : (t.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600')}`}>{t.type}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
                        <div className={`p-8 flex justify-between items-center ${modalType === 'expense' ? 'bg-slate-800' : 'bg-blue-600'} text-white`}>
                            <h3 className="font-black uppercase tracking-widest text-sm">Registro de Balcão</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <input type="number" step="0.01" className="w-full text-4xl font-black border-b-4 border-slate-100 outline-none text-center" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
                            <input type="text" className="w-full border-2 border-slate-100 p-4 rounded-2xl font-bold" placeholder="Descrição (Ex: Dinheiro)" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            <select className="w-full border-2 border-slate-100 p-4 rounded-2xl bg-slate-50 font-black" value={category} onChange={(e) => setCategory(e.target.value)}>
                                {modalType === 'income' ? (<><option value="Recarga Motorista">Recarga Motorista</option><option value="Adesão">Adesão / Cadastro</option></>) : (<option value="Despesa Operacional">Despesa Operacional</option>)}
                            </select>
                            {category === 'Recarga Motorista' && (
                                <select className="w-full border-2 border-blue-100 p-4 rounded-2xl bg-blue-50 font-black text-blue-900" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                                    <option value="">-- Selecionar Motorista --</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            )}
                            <button type="submit" disabled={saving} className={`w-full py-5 rounded-[24px] font-black text-white shadow-xl ${modalType === 'expense' ? 'bg-slate-800' : 'bg-blue-600'}`}>
                                {saving ? 'Salvando...' : 'CONFIRMAR AGORA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}