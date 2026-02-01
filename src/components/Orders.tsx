
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { Plus, Search, Filter, ArrowRight, CheckCircle, DollarSign, Save, X, Calendar, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const Orders: React.FC = () => {
  const { orders, customers, removeOrder, addOrder, updateOrder } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerId: '',
    frameModel: '',
    frameNotes: '',
    lensType: '',
    lensNotes: '',
    totalAmount: 0,
    paidAmount: 0,
    deliveryDate: '',
  });

  // --- Workflow Logic ---

  // --- Workflow Logic ---

  const advanceStatus = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let nextStatus = order.status;
    switch (order.status) {
      case OrderStatus.PENDING: nextStatus = OrderStatus.SENT_TO_LAB; break;
      case OrderStatus.SENT_TO_LAB: nextStatus = OrderStatus.RECEIVED_AT_STORE; break;
      case OrderStatus.RECEIVED_AT_STORE: nextStatus = OrderStatus.DELIVERED; break;
      default: return;
    }
    
    updateOrder({ ...order, status: nextStatus });
  };

  // --- Form Logic ---

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!newOrder.customerId) newErrors.customerId = "Selecione um cliente para a OS.";
    if (!newOrder.totalAmount || newOrder.totalAmount <= 0) newErrors.totalAmount = "Informe um valor total válido.";
    if (!newOrder.deliveryDate) newErrors.deliveryDate = "Informe uma data prevista para entrega.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveOrder = () => {
    if (!validateForm()) return;

    const customer = customers.find(c => c.id === newOrder.customerId);
    const total = Number(newOrder.totalAmount);
    const paid = Number(newOrder.paidAmount || 0);
    
    // Determine Payment Status automatically
    let payStatus = PaymentStatus.PENDING;
    if (paid >= total) payStatus = PaymentStatus.PAID;
    else if (paid > 0) payStatus = PaymentStatus.PARTIAL;

    const orderToAdd: Order = {
      id: `OS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerId: newOrder.customerId!,
      customerName: customer?.name || 'Cliente Desconhecido',
      date: new Date().toISOString().split('T')[0],
      status: OrderStatus.PENDING,
      totalAmount: total,
      paidAmount: paid,
      paymentStatus: payStatus,
      prescriptionId: 'temp', // In a real app, this would link to a selected prescription
      frameModel: newOrder.frameModel || 'Não informado',
      frameNotes: newOrder.frameNotes,
      lensType: newOrder.lensType || 'Não informado',
      lensNotes: newOrder.lensNotes,
      deliveryDate: newOrder.deliveryDate!
    };

    addOrder(orderToAdd);
    setIsCreating(false);
    setNewOrder({ 
      customerId: '', 
      frameModel: '', 
      frameNotes: '',
      lensType: '', 
      lensNotes: '',
      totalAmount: 0, 
      paidAmount: 0, 
      deliveryDate: '' 
    });
    setErrors({});
  };

  const updateField = (field: keyof typeof newOrder, value: any) => {
    setNewOrder(prev => ({ ...prev, [field]: value }));
    // Clear error for this field as the user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  // --- Render Helpers ---

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: 
        return { color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200', label: 'Falta Enviar', nextLabel: 'Enviar p/ Lab' };
      case OrderStatus.SENT_TO_LAB: 
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200', label: 'No Laboratório', nextLabel: 'Receber na Loja' };
      case OrderStatus.RECEIVED_AT_STORE: 
        return { color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', label: 'Na Loja', nextLabel: 'Entregar Cliente' };
      case OrderStatus.DELIVERED: 
        return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Entregue', nextLabel: '' };
      default: 
        return { color: 'bg-gray-100 text-gray-700', label: status, nextLabel: '' };
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'text-green-600 bg-green-50 border-green-100';
      case PaymentStatus.PARTIAL: return 'text-orange-600 bg-orange-50 border-orange-100';
      case PaymentStatus.PENDING: return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-gray-600';
    }
  };

  // Calculate remaining balance for new order form
  const remainingBalance = (Number(newOrder.totalAmount || 0) - Number(newOrder.paidAmount || 0));

  return (
    <div className="space-y-6">
      
      {!isCreating ? (
        <>
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
            <button 
              onClick={() => {
                setIsCreating(true);
                setErrors({});
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova OS
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou nº OS..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos os Status</option>
                {Object.values(OrderStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nº OS / Cliente</th>
                    <th className="px-6 py-4">Detalhes do Produto</th>
                    <th className="px-6 py-4">Status OS</th>
                    <th className="px-6 py-4">Financeiro</th>
                    <th className="px-6 py-4">Entrega</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const config = getStatusConfig(order.status);
                    const isClickable = order.status !== OrderStatus.DELIVERED;
                    const remaining = order.totalAmount - order.paidAmount;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{order.id}</div>
                          <div className="text-gray-600">{order.customerName}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="space-y-1">
                            <div>
                                <span className="font-medium text-gray-800">{order.frameModel}</span>
                                {order.frameNotes && (
                                    <div className="text-[10px] text-gray-500 italic leading-tight flex items-start gap-1">
                                        <Info className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                                        {order.frameNotes}
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="text-xs text-gray-600">{order.lensType}</span>
                                {order.lensNotes && (
                                    <div className="text-[10px] text-gray-500 italic leading-tight flex items-start gap-1">
                                        <Info className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                                        {order.lensNotes}
                                    </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => isClickable && advanceStatus(order.id)}
                            disabled={!isClickable}
                            className={`
                              group relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ease-in-out
                              ${config.color}
                              ${isClickable ? 'cursor-pointer transform active:scale-95' : 'cursor-default opacity-80'}
                            `}
                          >
                            {order.status === OrderStatus.DELIVERED && <CheckCircle className="w-3 h-3 mr-1" />}
                            <span>{order.status}</span>
                            
                            {isClickable && (
                              <div className="absolute left-full ml-2 hidden group-hover:flex items-center bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                                <span className="mr-1">Próximo:</span> {config.nextLabel} <ArrowRight className="w-3 h-3 ml-1" />
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-gray-500 text-xs">
                              <span>Total:</span>
                              <span className="font-medium text-gray-900">R$ {order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-xs">
                              <span>Pago (Entrada):</span>
                              <span className="font-medium text-green-600">R$ {order.paidAmount.toFixed(2)}</span>
                            </div>
                            {remaining > 0 && (
                               <div className="flex justify-between text-xs font-bold text-red-600 bg-red-50 px-1 rounded">
                               <span>Falta:</span>
                               <span>R$ {remaining.toFixed(2)}</span>
                             </div>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full border w-fit mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(order.deliveryDate).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
                                    removeOrder(order.id);
                                }
                            }}
                          >
                            <Trash2 className="w-5 h-5 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* --- CREATE ORDER FORM --- */
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Nova Ordem de Serviço
             </h2>
             <button 
                onClick={() => {
                  setIsCreating(false);
                  setErrors({});
                }}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
             >
                <X className="w-6 h-6" />
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Main Form */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados do Pedido</h3>
                   
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cliente <span className="text-red-500">*</span>
                        </label>
                        <select 
                           className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-colors ${errors.customerId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                           value={newOrder.customerId}
                           onChange={(e) => updateField('customerId', e.target.value)}
                        >
                           <option value="">Selecione um cliente...</option>
                           {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} - CPF: {c.cpf}</option>
                           ))}
                        </select>
                        {errors.customerId && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.customerId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo da Armação</label>
                                <input 
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: RayBan Aviador"
                                    value={newOrder.frameModel}
                                    onChange={(e) => updateField('frameModel', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 italic text-gray-500">Observações da Armação</label>
                                <input 
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Ex: Cor preta, haste flexível..."
                                    value={newOrder.frameNotes}
                                    onChange={(e) => updateField('frameNotes', e.target.value)}
                                />
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Lente</label>
                                <input 
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Multifocal Digital"
                                    value={newOrder.lensType}
                                    onChange={(e) => updateField('lensType', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 italic text-gray-500">Observações da Lente</label>
                                <input 
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Ex: Antirreflexo verde, borda polida..."
                                    value={newOrder.lensNotes}
                                    onChange={(e) => updateField('lensNotes', e.target.value)}
                                />
                            </div>
                         </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Previsão de Entrega <span className="text-red-500">*</span>
                        </label>
                        <input 
                           type="date"
                           className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.deliveryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                           value={newOrder.deliveryDate}
                           onChange={(e) => updateField('deliveryDate', e.target.value)}
                        />
                        {errors.deliveryDate && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.deliveryDate}
                          </p>
                        )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Financial Side Panel */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Financeiro
                   </h3>

                   <div className="space-y-5">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">
                           Valor Total (R$) <span className="text-red-500">*</span>
                         </label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                            <input 
                               type="number"
                               className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold transition-colors ${errors.totalAmount ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300 text-gray-900'}`}
                               placeholder="0.00"
                               value={newOrder.totalAmount || ''}
                               onChange={(e) => updateField('totalAmount', parseFloat(e.target.value))}
                            />
                         </div>
                         {errors.totalAmount && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.totalAmount}
                          </p>
                        )}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                         <label className="block text-sm font-bold text-green-800 mb-1">Valor de Entrada (Pago)</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">R$</span>
                            <input 
                               type="number"
                               className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-green-800 font-bold"
                               placeholder="0.00"
                               value={newOrder.paidAmount || ''}
                               onChange={(e) => updateField('paidAmount', parseFloat(e.target.value))}
                            />
                         </div>
                         <p className="text-xs text-green-600 mt-2">
                           O cliente pagou este valor no ato da compra.
                         </p>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                         <div className="flex justify-between text-sm text-gray-600">
                            <span>Total do Pedido:</span>
                            <span>R$ {(newOrder.totalAmount || 0).toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Entrada:</span>
                            <span>- R$ {(newOrder.paidAmount || 0).toFixed(2)}</span>
                         </div>
                         <div className={`flex justify-between text-lg font-bold pt-2 border-t border-dashed ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            <span>{remainingBalance > 0 ? 'Falta Pagar:' : 'Quitado:'}</span>
                            <span>R$ {Math.abs(remainingBalance).toFixed(2)}</span>
                         </div>
                         
                         <div className="pt-2 flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                               remainingBalance <= 0 ? 'bg-green-100 text-green-700 border-green-200' :
                               (newOrder.paidAmount || 0) > 0 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                               'bg-red-100 text-red-700 border-red-200'
                            }`}>
                               {remainingBalance <= 0 ? 'Status: Pago' : (newOrder.paidAmount || 0) > 0 ? 'Status: Parcial' : 'Status: Pendente'}
                            </span>
                         </div>
                      </div>
                   </div>

                   <button 
                      onClick={handleSaveOrder}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                   >
                      <Save className="w-5 h-5" />
                      Salvar Ordem de Serviço
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
