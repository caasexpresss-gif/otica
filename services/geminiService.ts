
import { GoogleGenAI } from "@google/genai";
import { Prescription } from "../types.ts";

export const getLensRecommendation = async (
  prescription: Prescription,
  lifestyle: string
): Promise<string> => {
  // Re-initialize to ensure it uses the latest process.env.API_KEY injected in this context
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!process.env.API_KEY) {
    return "Erro: Chave API do Gemini não disponível no ambiente.";
  }

  const prompt = `
    Atue como um oftalmologista especialista e consultor de ótica experiente.
    Com base na seguinte receita oftalmológica e no estilo de vida do cliente, recomende as melhores opções de lentes.

    DADOS DA RECEITA:
    Olho Direito (OD): Esférico ${prescription.od.spherical}, Cilíndrico ${prescription.od.cylinder}, Eixo ${prescription.od.axis}, Adição ${prescription.od.add || 'N/A'}
    Olho Esquerdo (OE): Esférico ${prescription.oe.spherical}, Cilíndrico ${prescription.oe.cylinder}, Eixo ${prescription.oe.axis}, Adição ${prescription.oe.add || 'N/A'}

    ESTILO DE VIDA/NECESSIDADES:
    ${lifestyle}

    FORMATO DA RESPOSTA (Markdown):
    1. Análise Técnica.
    2. Recomendação Principal.
    3. Opção Custo-Benefício.
    4. Tratamentos Essenciais.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt, // Simplified call format
    });

    return response.text || "O modelo não retornou uma resposta válida.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Ocorreu um erro ao conectar com o consultor IA. Verifique se a chave de API é válida.";
  }
};
