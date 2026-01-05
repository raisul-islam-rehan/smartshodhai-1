
import { GoogleGenAI, Modality, Type } from "@google/genai";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const chatWithFlash = async (prompt: string, context?: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are SmartShodhai Assistant, a helpful AI for Bangladeshi shop owners. 
      Use a friendly, professional Bangladeshi tone (e.g., Assalamu Alaikum, Bhai, Kemon achen). 
      Keep answers EXTREMELY short, simple, and direct. Use ৳ for currency.
      Use terms like 'Baki' for dues and 'Hishab' for accounts.
      ${context ? `Here is the current business data to help you answer accurately: ${context}` : ''}
      Focus on providing quick business insights. If a user asks to update stock or record a sale, confirm the details simply.`,
    }
  });
  return response.text;
};

// Advanced reasoning mode using Gemini 3 Pro
export const chatWithThinking = async (prompt: string, context?: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      systemInstruction: `You are SmartShodhai Assistant. Use a friendly Bangladeshi business tone.
      Provide deep analysis but summarize for a busy shop owner. Use ৳ for all amounts.
      ${context ? `Current Business Data: ${context}` : ''}
      Analyze and solve complex business problems for the distributor.`,
    }
  });
  return response.text;
};

// General image analysis for business context
export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
        { text: prompt || "Analyze this image and explain what is happening in the context of a retail business in Bangladesh. Keep it simple and use ৳." }
      ]
    }
  });
  return response.text;
};

// Specialized analysis for Product Labels
export const analyzeProductLabel = async (base64Image: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
        { text: "Identify this product, its brand, and suggested category. This is for a Bangladeshi FMCG store." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          brand: { type: Type.STRING },
          category: { type: Type.STRING },
          suggestedSellingPrice: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER }
        },
        required: ["name", "brand", "category"]
      }
    }
  });
  return JSON.parse(response.text);
};

// Specialized analysis for Handwritten Account Books (Khata)
export const analyzeAccountBook = async (base64Image: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
        { text: `Read this handwritten account book page. 
        Extract:
        1. List of products (Name, Quantity, Unit Price).
        2. Customer Name (if written).
        3. Due/Dena amount (if written).
        4. Determine if this is a Sale (Outgoing) or Purchase (Incoming).` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intent: { type: Type.STRING, description: "Incoming or Outgoing" },
          customerName: { type: Type.STRING },
          dueAmount: { type: Type.NUMBER },
          totalAmount: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "quantity"]
            }
          }
        },
        required: ["intent", "items"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateSpeech = async (text: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const decodeBase64Audio = async (base64: string, ctx: AudioContext) => {
  const data = decode(base64);
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
