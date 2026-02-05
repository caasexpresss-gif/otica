
import React, { useState } from 'react';
import { FinancialTransaction, TransactionType, TransactionCategory } from '../../types';
import { X, Save, DollarSign } from 'lucide-react';

interface AddTransactionModalProps {
    onClose: () => void;
    onSave: (transaction: Omit<FinancialTransaction, 'id'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        description: '',
        type: 'OUT' as TransactionType,
        category: 'OTHER' as TransactionCategory,
        amount: 0,
        paymentMethod: 'CASH' as any,
        status: 'PAID' as 'PAID' | 'PENDING',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Nova Movimentação
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <div className="flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'IN' }))}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border flex-1 ${
                                        formData.type === 'IN' 
                                        ? 'bg-green-600 text-white border-green-600' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    Entrada
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'OUT' }))}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border flex-1 ${
                                        formData.type === 'OUT' 
                                        ? 'bg-red-600 text-white border-red-600' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    Saída
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input 
                                type="date" 
                                name="date"
                                required
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <input 
                            type="text" 
                            name="description"
                            required
                            placeholder="Ex: Conta de Luz, Venda Avulsa..."
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                <input 
                                    type="number" 
                                    name="amount"
                                    step="0.01"
                                    required
                                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.amount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <select 
                                name="category"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="SALES">Vendas</option>
                                <option value="SUPPLIER">Fornecedores</option>
                                <option value="RENT">Aluguel</option>
                                <option value="UTILITIES">Contas (Luz/Água)</option>
                                <option value="SALARY">Salários</option>
                                <option value="OTHER">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Método Pagamento</label>
                            <select 
                                name="paymentMethod"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                            >
                                <option value="CASH">Dinheiro</option>
                                <option value="PIX">PIX</option>
                                <option value="CREDIT">Crédito</option>
                                <option value="DEBIT">Débito</option>
                                <option value="BOLETO">Boleto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                name="status"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="PAID">Pago / Concluído</option>
                                <option value="PENDING">Pendente (A Pagar/Receber)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-200 font-bold"
                        >
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
