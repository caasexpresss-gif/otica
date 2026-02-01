
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Product } from '../../types';
import { Printer, X } from 'lucide-react';

interface BarcodeGeneratorProps {
    onClose: () => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ onClose }) => {
    const { products } = useData();
    const [selectedProducts, setSelectedProducts] = useState<{product: Product, count: number}[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const addToSelection = (product: Product) => {
        const existing = selectedProducts.find(p => p.product.id === product.id);
        if (existing) {
            setSelectedProducts(prev => prev.map(p => p.product.id === product.id ? { ...p, count: p.count + 1 } : p));
        } else {
            setSelectedProducts(prev => [...prev, { product, count: 1 }]);
        }
    };

    const updateCount = (id: string, count: number) => {
        setSelectedProducts(prev => prev.map(p => p.product.id === id ? { ...p, count: Math.max(1, count) } : p));
    };

    const removeProduct = (id: string) => {
        setSelectedProducts(prev => prev.filter(p => p.product.id !== id));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const labelsHTML = selectedProducts.map(({ product, count }) => {
            const label = `
                <div class="label">
                    <p class="name">${product.name.substring(0, 20)}</p>
                    <p class="code">${product.code}</p>
                    <div class="bars">|||||||||||||||||</div>
                    <p class="price">R$ ${product.salesPrice.toFixed(2)}</p>
                </div>
            `;
            return Array(count).fill(label).join('');
        }).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir Etiquetas</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; display: flex; flex-wrap: wrap; gap: 10px; padding: 20px; }
                        .label { width: 150px; height: 80px; border: 1px border-radius: 4px; border: 1px solid #ccc; padding: 5px; text-align: center; display: flex; flex-direction: column; justify-content: center; page-break-inside: avoid; }
                        .name { font-size: 10px; font-weight: bold; margin: 0; white-space: nowrap; overflow: hidden; }
                        .code { font-size: 8px; margin: 2px 0; }
                        .bars { font-family: 'Libre Barcode 39', cursive; font-size: 20px; margin: 2px 0; letter-spacing: -1px; }
                        .price { font-size: 10px; font-weight: bold; margin: 0; }
                    </style>
                </head>
                <body>
                    ${labelsHTML}
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const searchedProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Printer className="w-5 h-5 text-blue-600" />
                        Gerador de Etiquetas
                    </h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                
                <div className="flex-1 overflow-hidden flex">
                    {/* Search Panel */}
                    <div className="w-1/2 p-6 border-r border-gray-100 flex flex-col">
                        <input 
                            type="text" 
                            placeholder="Buscar produtos para etiqueta..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <div className="flex-1 overflow-y-auto space-y-2">
                             {searchedProducts.map(p => (
                                 <div 
                                    key={p.id}
                                    onClick={() => addToSelection(p)}
                                    className="p-3 bg-gray-50 hover:bg-blue-50 cursor-pointer rounded-lg border border-transparent hover:border-blue-200 transition-colors"
                                 >
                                     <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                                     <p className="text-xs text-gray-500">{p.code} • R$ {p.salesPrice.toFixed(2)}</p>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Selection Panel */}
                    <div className="w-1/2 p-6 flex flex-col">
                        <h3 className="font-bold text-gray-700 mb-4">Produtos Selecionados</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {selectedProducts.map(({ product, count }) => (
                                <div key={product.id} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                                    <div className="truncate w-32">
                                        <p className="text-xs font-bold">{product.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={count} 
                                            onChange={(e) => updateCount(product.id, Number(e.target.value))}
                                            className="w-16 border rounded px-1 text-center"
                                        />
                                        <button onClick={() => removeProduct(product.id)} className="text-red-500 hover:text-red-700">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {selectedProducts.length === 0 && (
                                <p className="text-center text-gray-400 text-sm mt-10">Nenhum produto selecionado</p>
                            )}
                        </div>
                        <div className="mt-auto">
                            <button 
                                onClick={handlePrint}
                                disabled={selectedProducts.length === 0}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir {selectedProducts.reduce((acc, p) => acc + p.count, 0)} Etiquetas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeGenerator;
