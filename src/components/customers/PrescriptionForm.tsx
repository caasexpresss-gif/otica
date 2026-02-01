
import React, { useState } from 'react';
import { Prescription } from '../../types';
import { Plus, Save } from 'lucide-react';
import EyeInputGroup from '../EyeInputGroup';

interface PrescriptionFormProps {
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSave, onCancel }) => {
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    doctorName: '',
    od: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
    oe: { spherical: '0.00', cylinder: '0.00', axis: '0', pd: '', add: '', height: '' },
  });

  const handleEyeChange = (eye: 'od' | 'oe', field: string, value: string) => {
    setNewPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
      onSave({ ...newPrescription, id: Date.now().toString() });
  };

  return (
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
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Receita
        </button>
      </div>
    </div>
  );
};

export default PrescriptionForm;
