import React, { useState } from 'react';
import { getLensRecommendation } from '../services/geminiService';
import { Prescription } from '../types';
import { BrainCircuit, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import EyeInputGroup from './EyeInputGroup';

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
    setLoading(true);
    setRecommendation(null);
    try {
      const result = await getLensRecommendation(prescription, lifestyle);
      setRecommendation(result);
    } catch (err) {
      setRecommendation("Erro ao gerar recomendação. Verifique sua conexão.");
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
          Insira a receita e o perfil do cliente para obter recomendações técnicas precisas sobre materiais, índices e tratamentos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
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
            <label className="block text-sm text-gray-600 mb-2">
              Descreva a profissão, hobbies, ou queixas (ex: trabalha com TI, dirige à noite, sente dores de cabeça).
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Ex: O cliente é programador, passa 8h por dia no computador e reclama de cansaço visual no fim do dia."
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
                  Analisando...
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

        {/* Output Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
            Análise Técnica
          </h3>
          
          <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 overflow-y-auto">
            {!recommendation && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
                <p>Preencha os dados ao lado e clique em gerar para receber a consultoria.</p>
              </div>
            )}
            
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-indigo-600 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-medium animate-pulse">A Inteligência Artificial está analisando as dioptrias...</p>
              </div>
            )}

            {recommendation && !loading && (
              <div className="prose prose-indigo prose-sm max-w-none">
                 {/* Using ReactMarkdown to render the text response formatted by Gemini */}
                 <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h3 className="text-xl font-bold text-indigo-800 mb-3" {...props} />,
                      h2: ({node, ...props}) => <h4 className="text-lg font-bold text-gray-800 mt-4 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h5 className="font-bold text-gray-700 mt-3 mb-1" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-4" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-600 mb-3 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />
                    }}
                 >
                    {recommendation}
                 </ReactMarkdown>

                 <div className="mt-8 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>A recomendação é baseada em IA e serve como apoio à decisão. Valide sempre com o técnico responsável.</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LensAdvisor;
