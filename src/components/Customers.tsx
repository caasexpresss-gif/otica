
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import CustomerList from './customers/CustomerList';
import CustomerForm from './customers/CustomerForm';

type ViewMode = 'list' | 'form';

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer } = useData();
  const [view, setView] = useState<ViewMode>('list');
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  const handleNewCustomer = () => {
    setEditingCustomer(undefined);
    setView('form');
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setView('form');
  };

  const handleSaveCustomer = (customer: Customer) => {
    // Check if it's an update (exists in list) or new
    // Note: editingCustomer state might be undefined for new, but we need to check if ID exists to call update vs add
    // actually, simpler logic: if we passed initialCustomer, we are editing. 
    // BUT, the CustomerForm state manages the ID. 
    
    // Better logic: check if customer.id exists in current customers list? 
    // Or stick to: if editingCustomer was set, it's edit.
    
    // However, CustomerForm generates a NEW ID for new customers. 
    // Let's check existence by ID.
    const exists = customers.some(c => c.id === customer.id);
    
    if (exists) {
        updateCustomer(customer);
    } else {
        addCustomer(customer);
    }
    setView('list');
  };

  const handleCancel = () => {
    setView('list');
  };

  if (view === 'form') {
    return (
      <CustomerForm 
        initialCustomer={editingCustomer} 
        onSave={handleSaveCustomer}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <CustomerList 
      customers={customers} 
      onEdit={handleEditCustomer}
      onNew={handleNewCustomer}
    />
  );
};

export default Customers;
