import { GoogleGenAI } from '@google/genai';
import type { AIService, ChatMessage } from '../types/types';

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] });

export const geminiService: AIService = {
  name: 'Gemini',
  async chat(messages: ChatMessage[]) {
    const systemMsg = messages.find(m => m.role === 'system')?.content;
    const history = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: history,
      config: {
        ...(systemMsg ? { systemInstruction: systemMsg } : {}),
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    return (async function* () {
      for await (const chunk of response) {
        yield chunk.text || '';
      }
    })();
  }
};
