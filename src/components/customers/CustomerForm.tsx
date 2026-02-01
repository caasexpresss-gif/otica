
import React, { useState } from 'react';
import { Customer, Prescription, Address } from '../../types';
import { useData } from '../../context/DataContext';
import { User, FileText, MapPin, Briefcase, Save, ArrowLeft, Loader2, ShoppingBag, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import PrescriptionList from './PrescriptionList';
import PrescriptionForm from './PrescriptionForm';

interface CustomerFormProps {
  initialCustomer?: Customer;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

type TabMode = 'info' | 'prescriptions' | 'history' | 'credit';

const CustomerForm: React.FC<CustomerFormProps> = ({ initialCustomer, onSave, onCancel }) => {
  const { orders } = useData();
  const [activeTab, setActiveTab] = useState<TabMode>('info');
  
  const [customer, setCustomer] = useState<Customer>(initialCustomer || {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      cpf: '',
      prescriptions: [],
      address: {
        zipCode: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      creditLimit: 0,
      creditStatus: 'PENDING'
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [isSimulatingCredit, setIsSimulatingCredit] = useState(false);

  // Address Logic
  const lookupCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setCustomer(prev => ({
          ...prev,
          address: {
            ...(prev.address as Address),
            zipCode: cep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setCustomer(prev => ({
      ...prev,
      address: {
        ...(prev.address as Address),
        [field]: value
      }
    }));
    if (field === 'zipCode' && value.replace(/\D/g, '').length === 8) {
       lookupCep(value);
    }
  };

  // Prescription Logic
  const handleSavePrescription = (newPrescription: Prescription) => {
    const updatedPrescriptions = [newPrescription, ...(customer.prescriptions || [])];
    setCustomer(prev => ({ ...prev, prescriptions: updatedPrescriptions }));
    setIsAddingPrescription(false);
  };

  // Credit Logic
  const handleSimulateCredit = () => {
    setIsSimulatingCredit(true);
    setTimeout(() => {
        const approved = Math.random() > 0.3; // 70% chance approval
        setCustomer(prev => ({
            ...prev,
            creditStatus: approved ? 'APPROVED' : 'DENIED',
            creditLimit: approved ? 2000 : 0
        }));
        setIsSimulatingCredit(false);
    }, 1500);
  };

  // History Logic
  const customerOrders = orders.filter(o => o.customerId === customer.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {initialCustomer ? 'Editar Ficha do Cliente' : 'Novo Cadastro de Cliente'}
        </h1>
        <div className="ml-auto flex gap-2">
           {activeTab === 'info' || activeTab === 'credit' ? (
              <button 
                onClick={() => onSave(customer)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Salvar Cadastro
              </button>
           ) : null}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 rounded-t-xl">
        <nav className="-mb-px flex gap-8 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'prescriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Receitas <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{(customer.prescriptions || []).length}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Histórico de Compras
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'credit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Análise de Crédito
          </button>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <User className="w-5 h-5 text-blue-500" />
                    Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input 
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <input 
                        type="date"
                        value={customer.birthDate || ''}
                        onChange={(e) => setCustomer({...customer, birthDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input 
                        type="text"
                        value={customer.cpf || ''}
                        onChange={(e) => setCustomer({...customer, cpf: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                        <select 
                            value={customer.gender || ''}
                            onChange={(e) => setCustomer({...customer, gender: e.target.value as any})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <input 
                        type="text"
                        value={customer.profession || ''}
                        onChange={(e) => setCustomer({...customer, profession: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Contato e Endereço
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input 
                        type="text"
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-3">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                        type="email"
                        value={customer.email || ''}
                        onChange={(e) => setCustomer({...customer, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    
                    {/* Address Fields */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <div className="relative">
                          <input 
                              type="text"
                              value={customer.address?.zipCode || ''}
                              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                              placeholder="00000-000"
                          />
                          {isLoadingCep && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            </div>
                          )}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                        <input 
                            type="text"
                            value={customer.address?.street || ''}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input 
                            type="text"
                            value={customer.address?.number || ''}
                            onChange={(e) => handleAddressChange('number', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input 
                            type="text"
                            value={customer.address?.neighborhood || ''}
                            onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                     <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input 
                            type="text"
                            value={customer.address?.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                        <input 
                            type="text"
                            maxLength={2}
                            value={customer.address?.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                 </div>
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === 'prescriptions' && (
           <div className="space-y-6 animate-fade-in">
             {!isAddingPrescription ? (
               <>
                 <div className="flex justify-end">
                   <button 
                     onClick={() => setIsAddingPrescription(true)}
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                   >
                     <Plus className="w-4 h-4" />
                     Adicionar Nova Receita
                   </button>
                 </div>
                 <PrescriptionList prescriptions={customer.prescriptions} />
               </>
             ) : (
                <PrescriptionForm 
                    onSave={handleSavePrescription}
                    onCancel={() => setIsAddingPrescription(false)}
                />
             )}
           </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                     <ShoppingBag className="w-5 h-5 text-blue-500" />
                     Histórico de Compras e OS
                 </h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Valor Total</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Pagamento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customerOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                                    <td className="px-4 py-3">R$ {order.totalAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{order.paymentStatus}</td>
                                </tr>
                            ))}
                              {customerOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                       Nenhuma compra registrada para este cliente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
             </div>
        )}

        {/* CREDIT TAB */}
        {activeTab === 'credit' && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-blue-500" />
                     Análise de Crédito
                 </h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                         <h4 className="font-bold text-gray-700 mb-4">Situação Atual</h4>
                         
                         <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                customer.creditStatus === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                customer.creditStatus === 'DENIED' ? 'bg-red-100 text-red-600' :
                                'bg-gray-200 text-gray-500'
                            }`}>
                                {customer.creditStatus === 'APPROVED' ? <CheckCircle className="w-8 h-8" /> :
                                 customer.creditStatus === 'DENIED' ? <XCircle className="w-8 h-8" /> :
                                 <CreditCard className="w-8 h-8" />}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status do Crédito</p>
                                <p className={`text-xl font-bold ${
                                    customer.creditStatus === 'APPROVED' ? 'text-green-600' :
                                    customer.creditStatus === 'DENIED' ? 'text-red-600' :
                                    'text-gray-700'
                                }`}>
                                    {customer.creditStatus === 'APPROVED' ? 'APROVADO' :
                                     customer.creditStatus === 'DENIED' ? 'REPROVADO' :
                                     'PENDENTE / NÃO ANALISADO'}
                                </p>
                            </div>
                         </div>

                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Limite Liberado (R$)</label>
                                 <input 
                                    type="number"
                                    value={customer.creditLimit || 0}
                                    onChange={(e) => setCustomer({...customer, creditLimit: Number(e.target.value)})}
                                    className="w-full text-2xl font-bold text-green-700 bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                 />
                             </div>
                             <button 
                                onClick={handleSimulateCredit}
                                disabled={isSimulatingCredit}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold flex items-center justify-center gap-2"
                             >
                                {isSimulatingCredit ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Consultando Serasa...
                                    </>
                                ) : (
                                    'Consultar Score / Crédito'
                                )}
                             </button>
                             <p className="text-xs text-gray-400 text-center">
                                * Simulação de consulta externa (Score/Serasa)
                             </p>
                         </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="font-bold text-gray-700">Dicas para Análise</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                Verifique se o cliente possui restrições em outros estabelecimentos.
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                Confirme o endereço e tempo de residência.
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                Analise o histórico de pagamentos anteriores na loja (Aba Histórico).
                            </li>
                        </ul>
                     </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default CustomerForm;
