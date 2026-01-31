
import React, { useState } from 'react';
import { MOCK_CUSTOMERS, MOCK_ORDERS } from '../constants';
import { Customer, Order } from '../types';
import { Cake, Gift, Calendar, MessageCircle, Phone, TrendingUp, DollarSign, ShoppingBag, FileText, Filter, Search, User, Mail, Download, CheckCircle } from 'lucide-react';

type ReportType = 'birthdays' | 'sales';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('birthdays');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Birthday Report State
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentDay = now.getDate();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);

  // Sales Report State
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({
    start: firstDay,
    end: lastDay
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // --- Birthday Logic ---

  const getWhatsappLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const firstName = name.split(' ')[0];
    const message = `Olá ${firstName}, a equipe da OptiGestão deseja um feliz aniversário! 🎂 Como presente, preparamos um desconto especial para você ou um ajuste gratuito nos seus óculos. Venha nos visitar! 🥳`;
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getAgeTurning = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    return now.getFullYear() - birthDate.getFullYear();
  };

  const birthdayCustomers = MOCK_CUSTOMERS.filter(customer => {
    if (!customer.birthDate) return false;
    const parts = customer.birthDate.split('-');
    const month = parseInt(parts[1], 10) - 1;
    const matchesMonth = month === selectedMonth;
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesSearch;
  }).sort((a, b) => {
    const dayA = parseInt(a.birthDate!.split('-')[2], 10);
    const dayB = parseInt(b.birthDate!.split('-')[2], 10);
    return dayA - dayB;
  });

  const birthdaysToday = MOCK_CUSTOMERS.filter(c => {
    if (!c.birthDate) return false;
    const parts = c.birthDate.split('-');
    return (parseInt(parts[1], 10) - 1 === currentMonthIndex) && (parseInt(parts[2], 10) === currentDay);
  });

  // --- Sales Logic ---

  const filteredOrders = MOCK_ORDERS.filter(order => {
    return order.date >= dateRange.start && order.date <= dateRange.end;
  });

  const totalSales = filteredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const ordersCount = filteredOrders.length;
  const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Inteligência e Relatórios</h1>
            <p className="text-gray-500">Gestão de CRM e métricas financeiras</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Exportar Dados
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Selecione o Relatório
                </h3>
                <div className="space-y-1">
                    <button
                        onClick={() => setActiveReport('birthdays')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                            activeReport === 'birthdays'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Cake className="w-4 h-4" />
                        Aniversariantes
                    </button>
                    <button
                        onClick={() => setActiveReport('sales')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                            activeReport === 'sales'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Vendas por Período
                    </button>
                </div>
            </div>

            {activeReport === 'birthdays' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        Mês de Referência
                    </h3>
                    <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto pr-1">
                        {months.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => setSelectedMonth(index)}
                                className={`text-left px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    selectedMonth === index 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                                }`}
                            >
                                {month}
                                {index === currentMonthIndex && <span className="block text-[8px] text-blue-400 font-bold uppercase mt-0.5">Mês Atual</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeReport === 'sales' && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Filtrar Período
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Data Inicial</label>
                            <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Data Final</label>
                            <input 
                                type="date" 
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
            {activeReport === 'birthdays' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Birthday Dashboard KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-pink-500">
                            <div className="p-3 bg-pink-50 rounded-full text-pink-600">
                                <Cake className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Aniversariantes Hoje</p>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-bold text-gray-800">{birthdaysToday.length}</h3>
                                    {birthdaysToday.length > 0 && <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping"></span>}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total em {months[selectedMonth]}</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {MOCK_CUSTOMERS.filter(c => c.birthDate && parseInt(c.birthDate.split('-')[1], 10) - 1 === selectedMonth).length}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Lista de Aniversariantes do Mês
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar cliente..."
                                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/80 text-gray-500 font-medium uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Cliente / Idade</th>
                                        <th className="px-6 py-4">Informações de Contato</th>
                                        <th className="px-6 py-4 text-right">Ações Rápidas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {birthdayCustomers.length > 0 ? (
                                        birthdayCustomers.map((customer) => {
                                            const day = customer.birthDate!.split('-')[2];
                                            const isToday = (selectedMonth === currentMonthIndex) && (parseInt(day, 10) === currentDay);
                                            
                                            return (
                                                <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-pink-50/40' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold border transition-all ${
                                                            isToday 
                                                            ? 'bg-pink-600 text-white border-pink-700 shadow-md shadow-pink-200 scale-105' 
                                                            : 'bg-white text-gray-700 border-gray-200'
                                                        }`}>
                                                            <span className="text-[10px] leading-none mb-0.5 opacity-80 uppercase">{months[selectedMonth].substring(0,3)}</span>
                                                            <span className="text-lg leading-none">{day}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                                            {customer.name}
                                                            {isToday && <span className="bg-pink-100 text-pink-700 text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter border border-pink-200">Hoje!</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Completa <span className="font-semibold text-gray-700">{getAgeTurning(customer.birthDate!)} anos</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                                {customer.phone}
                                                            </div>
                                                            {customer.email && (
                                                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    {customer.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <a 
                                                                href={getWhatsappLink(customer.phone, customer.name)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                                                                title="Enviar WhatsApp"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                            </a>
                                                            <button 
                                                                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-gray-200" 
                                                                title="Ver Ficha Completa"
                                                            >
                                                                <User className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center space-y-2 opacity-60">
                                                    <Search className="w-8 h-8" />
                                                    <p className="text-xs font-medium italic">Nenhum aniversariante encontrado para os critérios selecionados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeReport === 'sales' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Faturamento Total</p>
                            <h3 className="text-2xl font-black text-gray-900">R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Faturamento positivo no período
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ordens de Serviço</p>
                            <h3 className="text-2xl font-black text-gray-900">{ordersCount}</h3>
                            <div className="mt-2 text-xs text-blue-600 font-medium">Contratos gerados</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ticket Médio</p>
                            <h3 className="text-2xl font-black text-gray-900">R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <div className="mt-2 text-xs text-purple-600 font-medium">Média por venda</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-sm">Detalhamento Financeiro</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Data Venda</th>
                                        <th className="px-6 py-4">Nome do Cliente</th>
                                        <th className="px-6 py-4">ID da OS</th>
                                        <th className="px-6 py-4 text-right">Total Pedido</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {new Date(order.date).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{order.customerName}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-medium">{order.lensType}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-mono border border-gray-200">{order.id}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900">
                                                    R$ {order.totalAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs italic">
                                                Nenhuma movimentação comercial registrada para as datas selecionadas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
