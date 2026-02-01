
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Order, Customer } from '../../types';
import { DollarSign, AlertTriangle, Calendar, Printer } from 'lucide-react';

interface DebtItem {
    order: Order;
    customer: Customer;
    daysOverdue: number;
    interest: number;
    totalWithInterest: number;
}

const DebtManagement: React.FC = () => {
    const { orders, customers } = useData();
    const [selectedDebt, setSelectedDebt] = useState<DebtItem | null>(null);

    // Filter unpaid orders
    const unpaidOrders = orders.filter(o => o.paymentStatus !== 'PAID');

    // Calculate debts
    const debts: DebtItem[] = unpaidOrders.map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        if (!customer) return null;

        // Calculate overdue days
        const dueDate = new Date(order.date); // Assuming order date is due date for simplicity, typically would be +30 days
        dueDate.setDate(dueDate.getDate() + 30); // 30 days term
        
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Interest calculation (Simulated: 2% fine + 1% per month)
        let interest = 0;
        if (daysOverdue > 0) {
            const fine = order.totalAmount * 0.02; // 2% Multa
            const monthlyInterest = (order.totalAmount * 0.01) * (daysOverdue / 30); // 1% Juros
            interest = fine + monthlyInterest;
        }

        return {
            order,
            customer,
            daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
            interest: interest,
            totalWithInterest: order.totalAmount + interest
        };
    }).filter(Boolean) as DebtItem[];

    // Sort by most overdue
    const sortedDebts = debts.sort((a, b) => b.daysOverdue - a.daysOverdue);

    const handlePrintCarne = (debt: DebtItem) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Carnê de Pagamento</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; }
                    .carne-container { border: 1px dashed #000; padding: 20px; margin-bottom: 20px; display: flex; }
                    .left { flex: 1; border-right: 1px dashed #000; padding-right: 20px; }
                    .right { flex: 2; padding-left: 20px; }
                    .header { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .value { font-weight: bold; }
                </style>
            </head>
            <body>
                <h2 style="text-align:center">CARNÊ DE PAGAMENTO - OPTIGESTÃO</h2>
                ${Array(3).fill(null).map((_, i) => `
                    <div class="carne-container">
                        <div class="left">
                            <div class="header">PARCELA ${i+1}/3</div>
                            <div class="row"><span>Vencimento:</span> <span class="value">${new Date(new Date().setDate(new Date().getDate() + (30 * (i+1)))).toLocaleDateString('pt-BR')}</span></div>
                            <div class="row"><span>Valor:</span> <span class="value">R$ ${(debt.totalWithInterest / 3).toFixed(2)}</span></div>
                            <div class="row"><span>Nº Doc:</span> <span>${debt.order.id}/${i+1}</span></div>
                        </div>
                        <div class="right">
                            <div class="header">RECIBO DO PAGADOR</div>
                            <div class="row"><span>Cliente:</span> <span class="value">${debt.customer.name}</span></div>
                            <div class="row"><span>Vencimento:</span> <span class="value">${new Date(new Date().setDate(new Date().getDate() + (30 * (i+1)))).toLocaleDateString('pt-BR')}</span></div>
                            <div class="row"><span>Valor Documento:</span> <span class="value">R$ ${(debt.totalWithInterest / 3).toFixed(2)}</span></div>
                            <br/>
                            <div style="border-top:1px solid #000; margin-top:20px; font-size:10px">Autenticação Mecânica</div>
                        </div>
                    </div>
                `).join('')}
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm text-red-600 font-medium">Total em Atraso</p>
                        <p className="text-2xl font-bold text-red-800">
                            R$ {debts.reduce((acc, d) => acc + d.order.totalAmount, 0).toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-medium">Juros Calculados</p>
                        <p className="text-2xl font-bold text-blue-800">
                            R$ {debts.reduce((acc, d) => acc + d.interest, 0).toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        Relatório de Inadimplência
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                         <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Venda Original</th>
                                <th className="px-6 py-4">Atraso</th>
                                <th className="px-6 py-4">Valor Original</th>
                                <th className="px-6 py-4">Juros/Multa</th>
                                <th className="px-6 py-4 text-right">Total Atualizado</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedDebts.map(debt => (
                                <tr key={debt.order.id} className="hover:bg-red-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{debt.customer.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(debt.order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${debt.daysOverdue > 30 ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {debt.daysOverdue} dias
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">R$ {debt.order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-red-600">+ R$ {debt.interest.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900">R$ {debt.totalWithInterest.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handlePrintCarne(debt)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Imprimir Carnê Atualizado"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sortedDebts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum cliente inadimplente encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DebtManagement;
