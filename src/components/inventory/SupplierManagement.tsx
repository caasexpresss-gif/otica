
import React, { useState } from 'react';
import { Supplier } from '../../types';
import { useData } from '../../context/DataContext';

import { Plus, Search, Truck, Phone, Mail, MapPin, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const SupplierManagement: React.FC = () => {
    const { suppliers, addSupplier, removeSupplier } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    // State to track delete confirmation level: { [id]: level }
    // Level 0: Normal (Trash Icon)
    // Level 1: "Tem certeza?" (Yellow)
    // Level 2: "Confirmar Exclusão" (Red)
    const [deleteConfirmations, setDeleteConfirmations] = useState<Record<string, number>>({});

    const [newSupplier, setNewSupplier] = useState<Supplier>({
        id: '',
        name: '',
        cnpj: '',
        contactName: '',
        phone: '',
        email: ''
    });

    const handleDeleteClick = (id: string) => {
        const currentLevel = deleteConfirmations[id] || 0;
        
        if (currentLevel === 0) {
            setDeleteConfirmations(prev => ({ ...prev, [id]: 1 }));
            // Auto reset after 3 seconds if not proceeding
            setTimeout(() => setDeleteConfirmations(prev => ({ ...prev, [id]: 0 })), 3000);
        } else if (currentLevel === 1) {
            setDeleteConfirmations(prev => ({ ...prev, [id]: 2 }));
        } else if (currentLevel === 2) {
            removeSupplier(id);
            // Cleanup state
            const newState = { ...deleteConfirmations };
            delete newState[id];
            setDeleteConfirmations(newState);
        }
    };

    const getDeleteButtonContent = (level: number) => {
        switch (level) {
            case 1:
                return (
                    <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                        Tem certeza?
                    </span>
                );
            case 2:
                return (
                    <span className="flex items-center gap-1 text-red-600 font-extrabold text-xs animate-bounce">
                        <AlertTriangle className="w-4 h-4" />
                        CONFIRMAR EXCLUSÃO
                    </span>
                );
            default:
                return <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />;
        }
    };

    // ... (keep handleSave and others)
    const handleSave = () => {
        addSupplier({ ...newSupplier, id: Date.now().toString() });
        setIsFormOpen(false);
        setNewSupplier({ id: '', name: '', cnpj: '', contactName: '', phone: '', email: '' });
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Gerenciar Fornecedores
                </h2>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo Fornecedor
                </button>
            </div>

            {/* ... (Form remains same) ... */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
                   {/* Form Content Copied for Context, assumed unchanged unless specified */}
                   <h3 className="font-bold text-gray-700 mb-4">Cadastro de Fornecedor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome</label>
                            <input 
                                type="text"
                                value={newSupplier.name}
                                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                            <input 
                                type="text"
                                value={newSupplier.cnpj}
                                onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contato</label>
                            <input 
                                type="text"
                                value={newSupplier.contactName}
                                onChange={(e) => setNewSupplier({...newSupplier, contactName: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                            <input 
                                type="text"
                                value={newSupplier.phone}
                                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email"
                                value={newSupplier.email}
                                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
                    </div>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Buscar fornecedores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800">{supplier.name}</h3>
                            <button 
                                onClick={() => handleDeleteClick(supplier.id)}
                                className="p-2 -mr-2 -mt-2 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                {getDeleteButtonContent(deleteConfirmations[supplier.id] || 0)}
                            </button>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block mb-2">
                            {supplier.cnpj}
                        </span>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                                <UserIcon className="w-3 h-3" /> {supplier.contactName}
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-3 h-3" /> {supplier.phone}
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-3 h-3" /> {supplier.email}
                            </p>
                        </div>
                    </div>
                ))}
                {filteredSuppliers.length === 0 && (
                    <div className="col-span-full text-center text-gray-400 py-8">
                        Nenhum fornecedor encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};


// Helper Icon
const UserIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default SupplierManagement;
