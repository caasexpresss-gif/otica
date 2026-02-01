
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { Search, Plus, Filter, Package, AlertCircle, Printer, Truck, Tag } from 'lucide-react';
import SupplierManagement from './inventory/SupplierManagement';
import BarcodeGenerator from './inventory/BarcodeGenerator';

type TabMode = 'products' | 'suppliers';

const Inventory: React.FC = () => {
    const { products, setProducts } = useData();
    const [activeTab, setActiveTab] = useState<TabMode>('products');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);

    // Filter Logic
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = products.filter(p => p.stockLevel <= p.minStockLevel).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowBarcodeGenerator(true)}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Printer className="w-4 h-4" />
                        Etiquetas
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm font-medium">
                        <Plus className="w-4 h-4" />
                        Novo Produto
                    </button>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 rounded-t-xl">
                 <nav className="-mb-px flex gap-8 px-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Package className="w-4 h-4" />
                        Produtos & Estoque
                    </button>
                    <button
                        onClick={() => setActiveTab('suppliers')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === 'suppliers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Truck className="w-4 h-4" />
                        Fornecedores
                    </button>
                 </nav>
            </div>

            {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Stats & Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total de Produtos</p>
                                <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estoque Baixo</p>
                                <p className="text-2xl font-bold text-gray-800">{lowStockCount}</p>
                            </div>
                        </div>
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Tag className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Valor em Estoque</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    R$ {products.reduce((acc, p) => acc + (p.costPrice * p.stockLevel), 0).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, código ou marca..." 
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
                                        <th className="px-6 py-4">Produto</th>
                                        <th className="px-6 py-4">Categoria/Marca</th>
                                        <th className="px-6 py-4">Preço Venda</th>
                                        <th className="px-6 py-4">Estoque</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">Cód: {product.code}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="font-medium">{product.category}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                R$ {product.salesPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {product.stockLevel} unid.
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {product.stockLevel <= product.minStockLevel ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Baixo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        OK
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'suppliers' && (
                <div className="animate-fade-in">
                    <SupplierManagement />
                </div>
            )}

            {/* Modals */}
            {showBarcodeGenerator && (
                <BarcodeGenerator onClose={() => setShowBarcodeGenerator(false)} />
            )}
        </div>
    );
};

export default Inventory;
