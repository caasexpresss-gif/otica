
import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { X, Save } from 'lucide-react';

interface AddProductModalProps {
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'soldCount'>) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        barcode: '',
        brand: '',
        category: 'FRAME' as ProductCategory,
        costPrice: 0,
        salesPrice: 0,
        stockLevel: 0,
        minStockLevel: 5
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
            [name]: name.includes('Price') || name.includes('Stock') ? Number(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Novo Produto</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Identificação</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                                    <input 
                                        type="text" 
                                        name="code"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.code}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Barras</label>
                                    <input 
                                        type="text" 
                                        name="barcode"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                    <input 
                                        type="text" 
                                        name="brand"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.brand}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                    <select 
                                        name="category"
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="FRAME">Armação</option>
                                        <option value="LENS">Lente</option>
                                        <option value="ACCESSORY">Acessório</option>
                                        <option value="SERVICE">Serviço</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Financial & Stock */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Valores & Estoque</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Custo</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                        <input 
                                            type="number" 
                                            name="costPrice"
                                            step="0.01"
                                            required
                                            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.costPrice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">R$</span>
                                        <input 
                                            type="number" 
                                            name="salesPrice"
                                            step="0.01"
                                            required
                                            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.salesPrice}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                                    <input 
                                        type="number" 
                                        name="stockLevel"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.stockLevel}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                                    <input 
                                        type="number" 
                                        name="minStockLevel"
                                        required
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.minStockLevel}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
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
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 font-bold"
                        >
                            <Save className="w-4 h-4" />
                            Salvar Produto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
