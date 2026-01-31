
import React, { useState, useEffect } from 'react';
import { MOCK_CUSTOMERS } from '../constants';
import { Customer, Prescription, Address } from '../types';
import { Search, Plus, User, FileText, Edit2, ArrowLeft, Save, Calendar, MapPin, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import EyeInputGroup from './EyeInputGroup';

type ViewMode = 'list' | 'form';
type TabMode = 'info' | 'prescriptions';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [view, setView] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  // Form State
  const [activeTab, setActiveTab] = useState<TabMode>('info');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Prescription Form State (New Prescription)
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    doctorName: '',
    od: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
    oe: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
  });

  // --- Helpers ---

  const isPrescriptionExpired = (dateString: string) => {
    if (!dateString) return false;
    const prescriptionDate = new Date(dateString);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);
    prescriptionDate.setHours(0, 0, 0, 0);
    
    return prescriptionDate < oneYearAgo;
  };

  const lookupCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro && editingCustomer) {
        setEditingCustomer({
          ...editingCustomer,
          address: {
            ...(editingCustomer.address as Address),
            zipCode: cep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  // --- Actions ---

  const handleNewCustomer = () => {
    setEditingCustomer({
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
      }
    });
    setView('form');
    setActiveTab('info');
  };

  const handleEditCustomer = (customer: Customer) => {
    const customerWithAddress = {
      ...customer,
      address: customer.address || { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' }
    };
    setEditingCustomer(customerWithAddress);
    setView('form');
    setActiveTab('info');
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer || !editingCustomer.name) return;

    setCustomers(prev => {
      const exists = prev.find(c => c.id === editingCustomer.id);
      if (exists) {
        return prev.map(c => c.id === editingCustomer.id ? editingCustomer : c);
      }
      return [...prev, editingCustomer];
    });
    setView('list');
  };

  const handleSavePrescription = () => {
    if (!editingCustomer) return;

    const prescriptionToAdd: Prescription = {
      ...newPrescription,
      id: Date.now().toString(),
    };

    const updatedCustomer = {
      ...editingCustomer,
      prescriptions: [prescriptionToAdd, ...(editingCustomer.prescriptions || [])]
    };

    setEditingCustomer(updatedCustomer);
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    
    setIsAddingPrescription(false);
    setNewPrescription({
      id: '',
      date: new Date().toISOString().split('T')[0],
      doctorName: '',
      od: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
      oe: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
    });
  };

  const handleEyeChange = (eye: 'od' | 'oe', field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    if (!editingCustomer) return;
    setEditingCustomer({
      ...editingCustomer,
      address: {
        ...(editingCustomer.address as Address),
        [field]: value
      }
    });

    if (field === 'zipCode' && value.replace(/\D/g, '').length === 8) {
      lookupCep(value);
    }
  };

  // --- Render Helpers ---

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm) ||
    c.phone.includes(searchTerm)
  );

  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Clientes</h1>
          <button 
            onClick={handleNewCustomer}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou telefone..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome / Profissão</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Documento (CPF)</th>
                  <th className="px-6 py-4">Localidade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{customer.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                             <Briefcase className="w-3 h-3" /> {customer.profession || 'Não informado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-gray-900">{customer.phone}</div>
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{customer.cpf || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {customer.address?.city ? `${customer.address.city}/${customer.address.state}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                      >
                        <Edit2 className="w-4 h-4" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setView('list')}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {editingCustomer?.id && MOCK_CUSTOMERS.find(c => c.id === editingCustomer.id) ? 'Editar Ficha do Cliente' : 'Novo Cadastro de Cliente'}
        </h1>
        <div className="ml-auto flex gap-2">
           {activeTab === 'info' && (
              <button 
                onClick={handleSaveCustomer}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Salvar Cadastro
              </button>
           )}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 rounded-t-xl">
        <nav className="-mb-px flex gap-8 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            Dados Cadastrais
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Histórico de Receitas <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{(editingCustomer?.prescriptions || []).length}</span>
          </button>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto">
        {activeTab === 'info' && editingCustomer && (
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
                        value={editingCustomer.name}
                        onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: João da Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <input 
                        type="date"
                        value={editingCustomer.birthDate || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, birthDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input 
                        type="text"
                        value={editingCustomer.cpf || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, cpf: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="000.000.000-00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                        <input 
                        type="text"
                        value={editingCustomer.rg || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, rg: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="00.000.000-0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                        <select 
                            value={editingCustomer.gender || ''}
                            onChange={(e) => setEditingCustomer({...editingCustomer, gender: e.target.value as any})}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Contato e Profissão
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input 
                        type="text"
                        value={editingCustomer.phone}
                        onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                        type="email"
                        value={editingCustomer.email || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="cliente@email.com"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <input 
                        type="text"
                        value={editingCustomer.profession || ''}
                        onChange={(e) => setEditingCustomer({...editingCustomer, profession: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: Motorista, Desenvolvedor, Professor (Importante para indicação de lentes)"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <div className="relative">
                          <input 
                              type="text"
                              value={editingCustomer.address?.zipCode || ''}
                              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                              onBlur={(e) => lookupCep(e.target.value)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                        <input 
                            type="text"
                            value={editingCustomer.address?.street || ''}
                            onChange={(e) => handleAddressChange('street', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input 
                            type="text"
                            value={editingCustomer.address?.number || ''}
                            onChange={(e) => handleAddressChange('number', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                        <input 
                            type="text"
                            value={editingCustomer.address?.complement || ''}
                            onChange={(e) => handleAddressChange('complement', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Apto, Bloco, etc."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input 
                            type="text"
                            value={editingCustomer.address?.neighborhood || ''}
                            onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input 
                            type="text"
                            value={editingCustomer.address?.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <input 
                            type="text"
                            maxLength={2}
                            value={editingCustomer.address?.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <label className="block text-sm font-bold text-gray-700 mb-2">Observações Gerais sobre o Cliente</label>
                 <textarea
                    rows={3}
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({...editingCustomer, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Ex: Cliente exigente com prazos, prefere contato via WhatsApp..."
                 />
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && editingCustomer && (
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

                <div className="space-y-4">
                  {(editingCustomer.prescriptions || []).length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhuma receita cadastrada para este cliente.</p>
                    </div>
                  )}

                  {(editingCustomer.prescriptions || []).map((prescription, index) => {
                    const isExpired = isPrescriptionExpired(prescription.date);
                    
                    return (
                        <div 
                            key={prescription.id} 
                            className={`border rounded-xl p-6 shadow-sm transition-all ${
                                isExpired 
                                    ? 'bg-red-50 border-red-200 ring-1 ring-red-100' 
                                    : 'bg-white border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800">Receita #{index + 1}</h3>
                                            {isExpired && (
                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase border border-red-200">
                                                    Vencida
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(prescription.date).toLocaleDateString('pt-BR')} • Dr(a). {prescription.doctorName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                      
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <EyeInputGroup label="od" values={prescription.od} onChange={() => {}} readOnly />
                                <EyeInputGroup label="oe" values={prescription.oe} onChange={() => {}} readOnly />
                            </div>
                      
                            {prescription.notes && (
                                <div className="mt-4 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                                    <strong>Observações da Receita:</strong> {prescription.notes}
                                </div>
                            )}
                        </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 ring-1 ring-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Nova Receita
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Receita</label>
                    <input 
                      type="date"
                      value={newPrescription.date}
                      onChange={(e) => setNewPrescription({...newPrescription, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Médico / Optometrista</label>
                    <input 
                      type="text"
                      value={newPrescription.doctorName}
                      onChange={(e) => setNewPrescription({...newPrescription, doctorName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Dr. Nome do Médico"
                    />
                  </div>
                </div>

                <div className="space-y-6 mb-6">
                  <EyeInputGroup 
                    label="od" 
                    values={newPrescription.od} 
                    onChange={(f, v) => handleEyeChange('od', f, v)} 
                  />
                  <EyeInputGroup 
                    label="oe" 
                    values={newPrescription.oe} 
                    onChange={(f, v) => handleEyeChange('oe', f, v)} 
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Receita</label>
                  <textarea 
                    rows={3}
                    value={newPrescription.notes || ''}
                    onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Ex: Lentes multifocais recomendadas..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button 
                    onClick={() => setIsAddingPrescription(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSavePrescription}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Receita
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
