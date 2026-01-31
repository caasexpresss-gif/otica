import { GoogleGenAI } from "@google/genai";
import { Prescription } from "../types";

// Ensure API Key is present
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getLensRecommendation = async (
  prescription: Prescription,
  lifestyle: string
): Promise<string> => {
  if (!API_KEY) {
    return "Erro: Chave API do Gemini não configurada. Por favor, configure a variável de ambiente API_KEY.";
  }

  const prompt = `
    Atue como um oftalmologista especialista e consultor de ótica experiente.
    Com base na seguinte receita oftalmológica e no estilo de vida do cliente, recomende as melhores opções de lentes (índice de refração, materiais, tratamentos como antirreflexo, filtro azul, fotossensível, etc.).

    DADOS DA RECEITA:
    Olho Direito (OD): Esférico ${prescription.od.spherical}, Cilíndrico ${prescription.od.cylinder}, Eixo ${prescription.od.axis}, Adição ${prescription.od.add || 'N/A'}
    Olho Esquerdo (OE): Esférico ${prescription.oe.spherical}, Cilíndrico ${prescription.oe.cylinder}, Eixo ${prescription.oe.axis}, Adição ${prescription.oe.add || 'N/A'}

    ESTILO DE VIDA/NECESSIDADES:
    ${lifestyle}

    FORMATO DA RESPOSTA:
    Forneça uma resposta formatada em Markdown.
    1. Resumo da análise técnica (ex: Alta miopia, presbiopia, etc).
    2. Recomendação Principal (A melhor opção sem restrição de orçamento).
    3. Recomendação Custo-Benefício.
    4. Tratamentos essenciais recomendados.
    Seja persuasivo mas técnico.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma recomendação no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao conectar com o consultor IA. Tente novamente mais tarde.";
  }
};