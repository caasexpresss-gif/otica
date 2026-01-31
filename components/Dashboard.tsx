
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, AlertCircle, Gift, ArrowRight, Trophy, Package } from 'lucide-react';
import { SALES_DATA_MONTHLY, SALES_DATA_WEEKLY, SALES_DATA_DAILY, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_TRANSACTIONS, MOCK_PRODUCTS, MOCK_EMPLOYEES } from '../constants';
import { OrderStatus } from '../types';
import { Link } from 'react-router-dom';

type TimeRange = 'daily' | 'weekly' | 'monthly';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  // --- Metrics Calculation ---
  const today = new Date().toISOString().split('T')[0];
  
  const todaysBills = MOCK_TRANSACTIONS.filter(t => t.date === today && t.type === 'OUT' && t.status === 'PENDING');
  const todaysBirthdays = MOCK_CUSTOMERS.filter(c => c.birthDate && c.birthDate.endsWith(today.slice(5))); // Match MM-DD

  const pendingSend = MOCK_ORDERS.filter(o => o.status === OrderStatus.PENDING).length;
  
  // Ranking Logic
  const topProducts = [...MOCK_PRODUCTS].sort((a, b) => b.soldCount - a.soldCount).slice(0, 3);
  const topEmployees = [...MOCK_EMPLOYEES].sort((a, b) => b.salesTotal - a.salesTotal);

  const getChartData = () => {
    switch (timeRange) {
      case 'daily': return SALES_DATA_DAILY;
      case 'weekly': return SALES_DATA_WEEKLY;
      case 'monthly': return SALES_DATA_MONTHLY;
      default: return SALES_DATA_MONTHLY;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Gerencial</h1>
          <p className="text-gray-500">Bem-vindo de volta, Administrador</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Daily Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accounts Today */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">HOJE</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Contas a Pagar do Dia</h3>
            <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">
                    R$ {todaysBills.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 mb-1">({todaysBills.length} contas)</span>
            </div>
            <Link to="/finance" className="text-blue-600 text-xs font-bold mt-3 inline-flex items-center hover:underline">
                Ver Financeiro <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
        </div>

        {/* Birthdays */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-pink-50 rounded-lg">
                    <Gift className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full">CRM</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Aniversariantes do Dia</h3>
            <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{todaysBirthdays.length}</span>
                <span className="text-sm text-gray-400 mb-1">clientes</span>
            </div>
            <Link to="/reports" className="text-blue-600 text-xs font-bold mt-3 inline-flex items-center hover:underline">
                Enviar Parabéns <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-50 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">ATENÇÃO</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Ordens Pendentes (Falta Enviar)</h3>
            <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{pendingSend}</span>
                <span className="text-sm text-gray-400 mb-1">OSs</span>
            </div>
             <Link to="/orders" className="text-blue-600 text-xs font-bold mt-3 inline-flex items-center hover:underline">
                Gerenciar Ordens <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Fluxo de Vendas</h3>
                <p className="text-xs text-gray-500">Acompanhamento gráfico do faturamento</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((t) => (
                    <button 
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${timeRange === t ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t === 'daily' ? 'Diário' : t === 'weekly' ? 'Semanal' : 'Mensal'}
                    </button>
                ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6b7280', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6b7280', fontSize: 12}}
                  tickFormatter={(value) => `R$${value/1000}k`}
                />
                <Tooltip 
                  cursor={{fill: '#eff6ff'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rankings Column */}
        <div className="space-y-6">
            
            {/* Top Employees */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Ranking de Vendedores
                </h3>
                <div className="space-y-4">
                    {topEmployees.map((emp, index) => (
                        <div key={emp.id} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                    index === 1 ? 'bg-gray-100 text-gray-700' : 
                                    'bg-orange-50 text-orange-700'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-xs text-gray-500">{emp.role}</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-green-600">R$ {emp.salesTotal.toLocaleString('pt-BR')}</span>
                        </div>
                    ))}
                </div>
            </div>

             {/* Top Products */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    Produtos Mais Vendidos
                </h3>
                <div className="space-y-4">
                    {topProducts.map((prod) => (
                        <div key={prod.id} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{prod.name}</p>
                                <p className="text-xs text-gray-500">{prod.brand}</p>
                            </div>
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
                                {prod.soldCount} un
                            </span>
                        </div>
                    ))}
                </div>
                <Link to="/inventory" className="block w-full text-center mt-4 text-xs text-blue-600 font-medium hover:underline">
                    Ver estoque completo
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
