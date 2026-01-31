
import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Product } from '../types';
import { Search, Plus, Package, Tag, Barcode, Upload, Printer, TrendingUp, AlertTriangle } from 'lucide-react';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  // Helper for standard Brazilian currency formatting
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Calculate KPIs
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stockLevel), 0);
  const lowStockCount = products.filter(p => p.stockLevel <= p.minStockLevel).length;

  const handleImportXml = () => {
    alert("Funcionalidade Simulada: Importação de XML de Nota Fiscal iniciada...");
    // Simulate adding a product from XML
    setTimeout(() => {
        alert("Sucesso! 5 novos itens importados da NF-e 12345.");
    }, 1000);
  };

  const handlePrintLabels = () => {
    alert("Funcionalidade Simulada: Gerando PDF de etiquetas para impressora térmica...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
        <div className="flex gap-2">
            <button 
                onClick={handlePrintLabels}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <Printer className="w-4 h-4" />
                Imprimir Etiquetas
            </button>
            <button 
                onClick={handleImportXml}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
            >
                <Upload className="w-4 h-4" />
                Importar XML (NF-e)
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                <Plus className="w-4 h-4" />
                Novo Produto
            </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Package className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">Total de Itens</p>
                <h3 className="text-xl font-bold text-gray-800">{products.reduce((acc, p) => acc + p.stockLevel, 0)} un.</h3>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full text-green-600">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">Valor em Estoque (Custo)</p>
                <h3 className="text-xl font-bold text-gray-800">{formatCurrency(totalStockValue)}</h3>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-full text-red-600">
                <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">Estoque Baixo</p>
                <h3 className="text-xl font-bold text-gray-800">{lowStockCount} produtos</h3>
            </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Buscar por nome, código, código de barras..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">Identificação</th>
                        <th className="px-6 py-4 text-center">Estoque</th>
                        <th className="px-6 py-4 text-right">Custo</th>
                        <th className="px-6 py-4 text-right">Venda</th>
                        <th className="px-6 py-4 text-right">Margem</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map(product => {
                        const margin = ((product.salesPrice - product.costPrice) / product.salesPrice) * 100;
                        const isLowStock = product.stockLevel <= product.minStockLevel;

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.brand} • {product.category}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Tag className="w-3 h-3" /> {product.code}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs mt-1">
                                        <Barcode className="w-3 h-3" /> {product.barcode}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {product.stockLevel}
                                    </span>
                                    {isLowStock && <div className="text-[10px] text-red-600 mt-1 font-medium">Repor Estoque</div>}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-600 font-medium">
                                    {formatCurrency(product.costPrice)}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    {formatCurrency(product.salesPrice)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`text-xs font-bold ${margin > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {margin.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
