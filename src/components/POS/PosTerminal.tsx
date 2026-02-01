
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Product, Customer, Order, OrderStatus, PaymentStatus } from '../../types';
import { Search, ShoppingCart, Trash2, User, CreditCard, Save, X, ScanBarcode, Percent, Calculator, LogOut } from 'lucide-react';

const PosTerminal: React.FC = () => {
  const { products, customers, addOrder, addTransaction, updateProductStock } = useData();
  
  // State
  const [cart, setCart] = useState<{product: Product; quantity: number}[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.salesPrice * item.quantity), 0);
  const total = subtotal - discount;

  // Handlers
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
    }));
  };

  const applyDiscount = () => {
     if (adminPassword === 'admin123') { // Mock password
         setShowDiscountInput(false);
         setAdminPassword('');
     } else {
         alert('Senha de gerente incorreta!');
     }
  };

  const handleFinalizeSale = (paymentMethod: string) => {
     if (!selectedCustomer) {
         alert('Selecione um cliente para finalizar a venda.');
         return;
     }

     const newOrder: Order = {
         id: Date.now().toString(),
         customerId: selectedCustomer.id,
         customerName: selectedCustomer.name,
         date: new Date().toISOString().split('T')[0],
         status: OrderStatus.PENDING,
         totalAmount: total,
         paidAmount: total,
         paymentStatus: PaymentStatus.PAID,
         prescriptionId: 'N/A', // Simplified for rapid sale
         frameModel: cart.map(i => i.product.name).join(', '),
         lensType: 'N/A',
         deliveryDate: new Date().toISOString().split('T')[0]
     };

     // Update Stock
     cart.forEach(item => {
         updateProductStock(item.product.id, -item.quantity);
     });

     // Register Transaction
     addTransaction({
         id: Date.now().toString(),
         date: new Date().toISOString().split('T')[0],
         description: `Venda PDV - ${selectedCustomer.name}`,
         type: 'IN',
         category: 'SALES',
         amount: total,
         status: 'PAID',
         paymentMethod: paymentMethod as any
     });

     addOrder(newOrder);

     // Reset
     setCart([]);
     setSelectedCustomer(null);
     setDiscount(0);
     setIsPaymentModalOpen(false);
     alert('Venda realizada com sucesso!');
  };

  // Searching
  const searchedProducts = searchTerm.length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.includes(searchTerm) ||
        p.barcode?.includes(searchTerm)
      ).slice(0, 5) 
    : [];

  const searchedCustomers = customerSearch.length > 0
    ? customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT COLUMN: Products & Search */}
      <div className="flex-1 flex flex-col gap-6">
          {/* Header & Search */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between mb-4">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <ShoppingCart className="w-6 h-6 text-blue-600" />
                     Caixa Livre / PDV
                 </h2>
                 <div className="flex gap-2">
                     <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors">
                         Abrir Caixa
                     </button>
                     <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors">
                         Fechar Caixa
                     </button>
                 </div>
             </div>

             <div className="relative">
                 <div className="relative">
                    <ScanBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Buscar produto (Nome, Código ou Barras)... F2 para focar" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {/* Search Results Dropdown */}
                 {searchedProducts.length > 0 && (
                     <div className="absolute z-10 w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                         {searchedProducts.map(product => (
                             <div 
                                key={product.id}
                                onClick={() => handleAddToCart(product)}
                                className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                             >
                                 <div>
                                     <p className="font-bold text-gray-800">{product.name}</p>
                                     <p className="text-xs text-gray-500">{product.code} - {product.brand}</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="font-bold text-blue-600">R$ {product.salesPrice.toFixed(2)}</p>
                                     <p className="text-xs text-gray-400">Estoque: {product.stockLevel}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
          </div>

          {/* Quick Actions / Categories (Simulated) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Armações', 'Lentes Solares', 'Lentes de Contato', 'Acessórios'].map(cat => (
                  <button key={cat} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-center">
                      <span className="font-medium text-gray-700">{cat}</span>
                  </button>
              ))}
          </div>
          
          <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-gray-400">
              <LogOut className="w-12 h-12 mb-2 opacity-50" />
              <p>Atalhos: F2 (Busca), F5 (Pagamento), ESC (Limpar)</p>
          </div>
      </div>

      {/* RIGHT COLUMN: Cart & Totals */}
      <div className="w-full md:w-96 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          
          {/* Customer Selection */}
          <div className="mb-6 pb-6 border-b border-gray-100">
              {selectedCustomer ? (
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <div>
                              <p className="text-sm font-bold text-blue-800">{selectedCustomer.name}</p>
                              <p className="text-xs text-blue-600">{selectedCustomer.cpf || 'Sem CPF'}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedCustomer(null)} className="text-blue-400 hover:text-blue-600">
                          <X className="w-4 h-4" />
                      </button>
                  </div>
              ) : (
                  <button 
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                      <User className="w-5 h-5" />
                      Selecionar Cliente (F9)
                  </button>
              )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <ShoppingCart className="w-12 h-12 mb-2" />
                      <p>Carrinho vazio</p>
                  </div>
              ) : (
                  cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                           <div className="flex-1">
                               <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                   <div className="flex items-center bg-white rounded border border-gray-200">
                                       <button onClick={() => handleQuantityChange(item.product.id, -1)} className="px-2 py-0.5 text-gray-500 hover:bg-gray-100">-</button>
                                       <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                       <button onClick={() => handleQuantityChange(item.product.id, 1)} className="px-2 py-0.5 text-gray-500 hover:bg-gray-100">+</button>
                                   </div>
                                   <span className="text-xs text-gray-500">x R$ {item.product.salesPrice.toFixed(2)}</span>
                               </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                               <span className="font-bold text-gray-800">R$ {(item.product.salesPrice * item.quantity).toFixed(2)}</span>
                               <button onClick={() => handleRemoveFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                      </div>
                  ))
              )}
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500 cursor-pointer hover:bg-red-50 p-1 -mx-1 rounded" onClick={() => setShowDiscountInput(!showDiscountInput)}>
                  <span className="flex items-center gap-1"><Percent className="w-4 h-4" /> Desconto</span>
                  <span>- R$ {discount.toFixed(2)}</span>
              </div>
              
              {showDiscountInput && (
                  <div className="bg-red-50 p-3 rounded-lg space-y-2">
                       <p className="text-xs text-red-700 font-bold">Autorização de Gerente Necessária</p>
                       <input 
                         type="password" 
                         placeholder="Senha do Gerente" 
                         className="w-full text-sm p-2 rounded border border-red-200"
                         value={adminPassword}
                         onChange={(e) => setAdminPassword(e.target.value)}
                       />
                       <div className="flex gap-2">
                           <input 
                             type="number" 
                             placeholder="Valor R$" 
                             className="w-full text-sm p-2 rounded border border-red-200"
                             onChange={(e) => setDiscount(Number(e.target.value))}
                           />
                           <button onClick={applyDiscount} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Aplicar</button>
                       </div>
                  </div>
              )}

              <div className="flex justify-between text-2xl font-bold text-gray-800 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
              </div>

              <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={cart.length === 0}
                  className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <CreditCard className="w-6 h-6" />
                  Finalizar Venda
              </button>
          </div>
      </div>

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Selecionar Cliente</h3>
                    <button onClick={() => setIsCustomerModalOpen(false)}><X className="w-5 h-5" /></button>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar cliente..." 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    autoFocus
                />
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchedCustomers.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => { setSelectedCustomer(c); setIsCustomerModalOpen(false); setCustomerSearch(''); }}
                            className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        >
                            <p className="font-bold text-gray-800">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.cpf}</p>
                        </div>
                    ))}
                    {customers.length > 0 && searchedCustomers.length === 0 && customerSearch !== '' && (
                         <div className="text-center text-gray-500 py-4">Nenhum cliente encontrado</div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Payment Modal (Simplified) */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl text-center">
                  <h3 className="text-xl font-bold mb-6">Forma de Pagamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {['CREDIT', 'DEBIT', 'CASH', 'PIX'].map(method => (
                          <button 
                             key={method}
                             onClick={() => handleFinalizeSale(method)}
                             className="p-4 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold border border-gray-200"
                          >
                              {method === 'CREDIT' ? 'Crédito' : 
                               method === 'DEBIT' ? 'Débito' : 
                               method === 'CASH' ? 'Dinheiro' : 'PIX'}
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="mt-6 text-gray-500 hover:text-gray-800">Cancelar</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default PosTerminal;
