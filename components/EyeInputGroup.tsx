
import React from 'react';
import { EyePrescription } from '../types';

interface EyeInputGroupProps {
  label: string;
  values: EyePrescription; // Using the type directly
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

const EyeInputGroup: React.FC<EyeInputGroupProps> = ({ label, values, onChange, readOnly = false }) => {
  // Helper to safely handle changes regardless of the structure
  const handleChange = (field: keyof EyePrescription, value: string) => {
    if (!readOnly) {
      onChange(field, value);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${label === 'od' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
        {label === 'od' ? 'Olho Direito (OD)' : 'Olho Esquerdo (OE)'}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Esférico</label>
          <input 
            type="number" 
            step="0.25"
            value={values.spherical}
            onChange={(e) => handleChange('spherical', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="0.00"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Cilíndrico</label>
          <input 
            type="number" 
            step="0.25"
            value={values.cylinder}
            onChange={(e) => handleChange('cylinder', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="0.00"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Eixo</label>
          <input 
            type="number" 
            value={values.axis}
            onChange={(e) => handleChange('axis', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="0"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1" title="Distância Pupilar">DNP (mm)</label>
          <input 
            type="text" 
            value={values.pd || ''}
            onChange={(e) => handleChange('pd', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="32"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1" title="Altura de Montagem">Altura (mm)</label>
          <input 
            type="text" 
            value={values.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="18"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Adição</label>
          <input 
            type="number" 
            step="0.25"
            value={values.add || ''}
            onChange={(e) => handleChange('add', e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            disabled={readOnly}
            placeholder="+2.00"
          />
        </div>
      </div>
    </div>
  );
};

export default EyeInputGroup;
