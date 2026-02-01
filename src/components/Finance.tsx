
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Calendar, Search, CheckCircle, AlertCircle, FileText, Lock, AlertTriangle } from 'lucide-react';
import DebtManagement from './finance/DebtManagement';

type Tab = 'cash-flow' | 'payable' | 'receivable' | 'debtors' | 'reconciliation';

const Finance: React.FC = () => {
  const { transactions } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('cash-flow');
  
  // KPIs
  const totalIn = transactions.filter(t => t.type === 'IN' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;
  const pendingPayable = transactions.filter(t => t.type === 'OUT' && t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0);

  // Filter logic
  const getFilteredTransactions = () => {
      switch (activeTab) {
          case 'payable':
              return transactions.filter(t => t.type === 'OUT' && t.status === 'PENDING');
          case 'receivable':
              return transactions.filter(t => t.type === 'IN' && t.status === 'PENDING');
          default:
              return transactions;
      }
  };

  const filteredTransactions = getFilteredTransactions();

  const handleReconcile = () => {
      const password = prompt("Digite a senha de gerente para fechar o caixa:");
      if (password === 'admin123') {
          alert("Caixa conferido e fechado com sucesso! Relatório enviado por email.");
      } else if (password) {
          alert("Senha incorreta.");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestão Financeira</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
            <DollarSign className="w-4 h-4" />
            Nova Movimentação
        </button>
      </div>

      {/* Financial Overview Cards */}
      {activeTab !== 'debtors' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Saldo em Caixa (Atual)</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-500">Entradas (Mês)</p>
                    <ArrowUpCircle className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-700">
                    R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-500">Saídas (Mês)</p>
                    <ArrowDownCircle className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-red-700">
                    R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 bg-red-50">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-red-800">Contas a Pagar</p>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-800">
                    R$ {pendingPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 rounded-t-xl">
        <nav className="-mb-px flex gap-6 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cash-flow')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cash-flow' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Fluxo de Caixa
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payable' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            Contas a Pagar
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'receivable' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            A Receber
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'debtors' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Inadimplência
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reconciliation' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Conferência de Caixa
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-100 min-h-[400px]">
          {activeTab === 'debtors' ? (
              <div className="p-6 animate-fade-in">
                  <DebtManagement />
              </div>
          ) : activeTab === 'reconciliation' ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                <div className="p-4 bg-blue-50 rounded-full">
                    <Lock className="w-12 h-12 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Conferência e Fechamento de Caixa</h2>
                    <p className="text-gray-500 mt-1 max-w-md">
                        Realize a contagem física dos valores em gaveta e confronte com o saldo do sistema.
                        A liberação do fechamento exige senha gerencial.
                    </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Saldo do Sistema:</span>
                        <span className="text-xl font-bold text-gray-900">R$ {balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dinheiro em Gaveta:</span>
                        <input type="number" className="w-32 p-1 border rounded text-right" placeholder="0.00" />
                    </div>
                </div>

                <button 
                    onClick={handleReconcile}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200"
                >
                    Realizar Fechamento
                </button>
            </div>
          ) : (
            <div className="overflow-x-auto animate-fade-in">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Valor</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(t.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {t.description}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {t.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-xs">
                                    {t.paymentMethod || '-'}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'IN' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {t.status === 'PAID' ? (
                                        <span className="text-green-600 flex justify-center"><CheckCircle className="w-5 h-5" /></span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Pendente</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Nenhuma transação encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default Finance;
