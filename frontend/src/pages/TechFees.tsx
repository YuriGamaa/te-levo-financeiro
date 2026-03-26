import { useEffect, useState } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Calculator, 
    FileText, 
    Activity, 
    Download, 
    Building2,
    Loader2,
    Plus,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExtraItem {
    description: string;
    unit_value: number;
    quantity: number;
}

export default function TechFees() {
    const [franchises, setFranchises] = useState<any[]>([]); 
    const [selectedFranchise, setSelectedFranchise] = useState('');
    
    const [month, setMonth] = useState(new Date().getMonth() + 1); 
    const [year, setYear] = useState(new Date().getFullYear());
    
    // Métricas de Consumo Fixas
    const [metrics, setMetrics] = useState({
        completed_rides: 0,
        incomplete_rides: 0,
        sms: 0,
        cpf_validation: 0,
        driver_cpf_validation: 0,
        route_view: 0
    });

    // ITENS EXTRAS (O Novo Pedido do Cliente)
    const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);

    const [bill, setBill] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

    const RATES = {
        completed_rides: 0.32,
        incomplete_rides: 0.16,
        sms: 0.13,
        cpf_validation: 0.13,
        driver_cpf_validation: 0.13,
        route_view: 0.02
    };

    const labels: any = {
        completed_rides: 'Corridas finalizadas',
        incomplete_rides: 'Corridas não finalizadas',
        sms: 'SMS',
        cpf_validation: 'Validação CPF',
        driver_cpf_validation: 'Validação CPF motorista',
        route_view: 'Rota exibida durante a viagem'
    };

    useEffect(() => {
        loadFranchises();
    }, []);

    async function loadFranchises() {
        try {
            const response = await api.get('/franchises');
            setFranchises(response.data);
        } catch (error) {
            console.error("Erro ao carregar franquias", error);
        }
    }

    // Funções para Itens Extras
    const addExtraItem = () => {
        setExtraItems([...extraItems, { description: '', unit_value: 0, quantity: 1 }]);
    };

    const removeExtraItem = (index: number) => {
        setExtraItems(extraItems.filter((_, i) => i !== index));
    };

    const updateExtraItem = (index: number, field: keyof ExtraItem, value: any) => {
        const newItems = [...extraItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setExtraItems(newItems);
    };

    async function handleCalculate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFranchise) return toast.error('Selecione uma franquia!');
        setCalculating(true);

        try {
            // 1. Cálculo dos Fixos
            const items = Object.keys(RATES).map(key => {
                const qty = (metrics as any)[key];
                const unit = (RATES as any)[key];
                return { label: labels[key], qty, unit, total: qty * unit };
            });

            // 2. Cálculo dos Extras
            const extraLines = extraItems.map(item => ({
                label: item.description || 'Item Extra',
                qty: item.quantity,
                unit: item.unit_value,
                total: item.unit_value * item.quantity
            }));

            const allItems = [...items, ...extraLines];
            const totalPagar = allItems.reduce((acc, curr) => acc + curr.total, 0);

            const simulationBill = {
                details: {
                    items: allItems,
                    total: totalPagar
                }
            };

            await new Promise(resolve => setTimeout(resolve, 600)); 
            setBill(simulationBill); 
            toast.success("Demonstrativo calculado!");

        } catch (error) {
            toast.error('Erro ao calcular.');
        } finally {
            setCalculating(false);
        }
    }

    function handleExportPDF() {
        if (!bill || !selectedFranchise) return;

        const doc = new jsPDF();
        const franchiseObj = franchises.find((f: any) => f.id.toString() === selectedFranchise);
        const franchiseName = franchiseObj ? franchiseObj.name : 'Franquia';

        doc.setFillColor(8, 51, 68);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Te Levo Mobile", 14, 20);
        doc.setFontSize(12);
        doc.text("Demonstrativo Mensal", 14, 30);
        doc.setFontSize(10);
        doc.text(`Unidade: ${franchiseName}`, 150, 20);
        doc.text(`MÊS: ${month}/${year}`, 150, 30);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Detalhamento de Débitos", 14, 55);

        const tableData = bill.details.items.map((item: any) => [
            item.label,
            `R$ ${item.unit.toFixed(2).replace('.', ',')}`,
            item.qty,
            `R$ ${item.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        ]);

        tableData.push([
            { content: 'Total a pagar', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 253, 244] } },
            { content: `R$ ${bill.details.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, styles: { fontStyle: 'bold', fillColor: [240, 253, 244] } }
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['DESCRIÇÃO', 'Valor Unitário', 'Quantidade', 'Total']],
            body: tableData,
            headStyles: { fillColor: [8, 51, 68] },
            theme: 'grid'
        });

        doc.save(`Demonstrativo_${franchiseName}_${month}-${year}.pdf`);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-cyan-950 flex items-center gap-2">
                    <Building2 className="text-cyan-600" /> Demonstrativo de Franquia
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Franquia</label>
                                <select className="w-full border p-2.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-cyan-500" value={selectedFranchise} onChange={e => setSelectedFranchise(e.target.value)} required>
                                    <option value="">Selecione...</option>
                                    {franchises.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mês</label>
                                <select className="w-full border p-2.5 rounded-xl bg-slate-50 outline-none" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ano</label>
                                <input type="number" className="w-full border p-2.5 rounded-xl bg-slate-50 outline-none" value={year} onChange={e => setYear(parseInt(e.target.value))} />
                            </div>
                        </div>

                        <hr className="border-slate-100"/>

                        <div>
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-cyan-600"/> Custos de Software (Fixos)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(labels).map((key) => (
                                    <div key={key}>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">{labels[key]}</label>
                                        <input type="number" className="w-full border p-2 rounded-lg outline-none focus:border-cyan-500" value={(metrics as any)[key]} onChange={e => setMetrics({...metrics, [key]: parseInt(e.target.value) || 0})}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Plus size={16} className="text-green-600"/> Itens Extras e Ajustes
                                </h3>
                                <button type="button" onClick={addExtraItem} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-colors">
                                    + Adicionar Campo
                                </button>
                            </div>

                            <div className="space-y-3">
                                {extraItems.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-end bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                        <div className="flex-1">
                                            <input className="w-full border-b bg-transparent p-1 text-sm focus:outline-none focus:border-cyan-500" value={item.description} onChange={(e) => updateExtraItem(index, 'description', e.target.value)} placeholder="Descrição do item" />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">Valor Un.</label>
                                            <input type="number" className="w-full border-b bg-transparent p-1 text-sm focus:outline-none" value={item.unit_value} onChange={(e) => updateExtraItem(index, 'unit_value', Number(e.target.value))} />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">Qtd</label>
                                            <input type="number" className="w-full border-b bg-transparent p-1 text-sm focus:outline-none" value={item.quantity} onChange={(e) => updateExtraItem(index, 'quantity', Number(e.target.value))} />
                                        </div>
                                        <button type="button" onClick={() => removeExtraItem(index)} className="text-red-400 hover:text-red-600 pb-1">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={calculating} className="w-full bg-cyan-950 text-white py-4 rounded-xl font-bold hover:bg-cyan-900 transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-900/20">
                            {calculating ? <Loader2 className="animate-spin"/> : <><Calculator size={20} /> Calcular e Atualizar Extrato</>}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    {bill ? (
                        <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2"><FileText className="text-cyan-600" /> Extrato</h2>
                                <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded font-bold">{month}/{year}</span>
                            </div>
                            
                            <div className="space-y-3 text-sm text-slate-600 max-h-[400px] overflow-y-auto pr-2">
                                {bill.details.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-xs flex-1 pr-2">{item.label}</span>
                                        <span className="font-bold whitespace-nowrap">R$ {item.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Total a Pagar</span>
                                <span className="text-4xl font-bold text-cyan-900 tracking-tight">
                                    {bill.details.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            <button onClick={handleExportPDF} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20">
                                <Download size={18} /> Baixar PDF Oficial
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                            <Calculator size={48} className="mb-4 opacity-10 text-slate-900" />
                            <p className="font-medium text-slate-500">Aguardando Cálculo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}