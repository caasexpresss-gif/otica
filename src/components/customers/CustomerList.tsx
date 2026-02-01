
import React, { useState } from 'react';
import { Customer } from '../../types';
import { Search, Plus, Briefcase, Edit2 } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onNew: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onNew }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cpf && c.cpf.includes(searchTerm)) ||
    c.phone.includes(searchTerm)
  );

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Clientes</h1>
          <button 
            onClick={onNew}
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
                        onClick={() => onEdit(customer)}
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
};

export default CustomerList;
