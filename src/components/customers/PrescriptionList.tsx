
import React from 'react';
import { Prescription } from '../../types';
import { FileText, Calendar, AlertTriangle } from 'lucide-react';
import EyeInputGroup from '../EyeInputGroup';

interface PrescriptionListProps {
  prescriptions: Prescription[];
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ prescriptions }) => {

  const isPrescriptionExpired = (dateString: string) => {
    if (!dateString) return false;
    const prescriptionDate = new Date(dateString);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);
    prescriptionDate.setHours(0, 0, 0, 0);
    
    return prescriptionDate < oneYearAgo;
  };

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">Nenhuma receita cadastrada para este cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription, index) => {
        const isExpired = isPrescriptionExpired(prescription.date);
        
        return (
            <div 
                key={prescription.id} 
                className={`border rounded-xl p-6 shadow-sm transition-all ${
                    isExpired 
                        ? 'bg-red-50 border-red-200 ring-1 ring-red-100' 
                        : 'bg-white border-gray-200 hover:shadow-md'
                }`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">Receita #{index + 1}</h3>
                                {isExpired && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase border border-red-200">
                                        Vencida
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {new Date(prescription.date).toLocaleDateString('pt-BR')} • Dr(a). {prescription.doctorName}
                            </p>
                        </div>
                    </div>
                </div>
          
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <EyeInputGroup label="od" values={prescription.od} onChange={() => {}} readOnly />
                    <EyeInputGroup label="oe" values={prescription.oe} onChange={() => {}} readOnly />
                </div>
          
                {prescription.notes && (
                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                        <strong>Observações da Receita:</strong> {prescription.notes}
                    </div>
                )}
            </div>
        );
      })}
    </div>
  );
};

export default PrescriptionList;
