
import React, { useState } from 'react';
import { getLensRecommendation } from '../services/geminiService.ts';
import { Prescription } from '../types.ts';
import { BrainCircuit, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import EyeInputGroup from './EyeInputGroup.tsx';

const LensAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [lifestyle, setLifestyle] = useState('');
  const [prescription, setPrescription] = useState<Prescription>({
    id: 'temp',
    date: new Date().toISOString(),
    doctorName: '',
    od: { spherical: '0.00', cylinder: '0.00', axis: '0' },
    oe: { spherical: '0.00', cylinder: '0.00', axis: '0' }
  });

  const handleEyeChange = (eye: 'od' | 'oe', field: string, value: string) => {
    setPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));
  };

  const generateRecommendation = async () => {
    if (!lifestyle.trim()) {
        alert("Por favor, descreva o estilo de vida do cliente.");
        return;
    }
    setLoading(true);
    setRecommendation(null);
    try {
      const result = await getLensRecommendation(prescription, lifestyle);
      setRecommendation(result);
    } catch (err) {
      setRecommendation("Erro ao gerar recomendação. Verifique sua conexão e chave API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <BrainCircuit className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Consultor de Lentes IA</h1>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">
          Insira a receita e o perfil do cliente para obter recomendações técnicas precisas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">1</span>
              Dados da Receita
            </h3>
            
            <div className="space-y-4">
              <EyeInputGroup 
                label="od" 
                values={prescription.od} 
                onChange={(f, v) => handleEyeChange('od', f, v)} 
              />
              <EyeInputGroup 
                label="oe" 
                values={prescription.oe} 
                onChange={(f, v) => handleEyeChange('oe', f, v)} 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">2</span>
              Perfil do Cliente
            </h3>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Ex: Cliente trabalha 10h/dia no computador e dirige à noite."
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
            />
            
            <button
              onClick={generateRecommendation}
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  IA Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Recomendação
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
            Análise Técnica
          </h3>
          
          <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 overflow-y-auto">
            {recommendation && (
              <div className="prose prose-indigo prose-sm max-w-none">
                 <ReactMarkdown>{recommendation}</ReactMarkdown>
                 <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Valide sempre com o técnico responsável.</span>
                 </div>
              </div>
            )}
            {!recommendation && !loading && (
              <p className="text-gray-400 text-center mt-20">Aguardando dados para análise...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LensAdvisor;
