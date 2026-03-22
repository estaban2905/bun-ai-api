import { GoogleGenAI } from '@google/genai';
import type { AIService, ChatMessage } from '../types/types';

const ai = new GoogleGenAI({ apiKey: process.env['GEMINI_API_KEY'] });

export const geminiService: AIService = {
  name: 'Gemini',
  async chat(messages: ChatMessage[]) {
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => m.content)
      .join('\n');

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents,
    });

    return (async function* () {
      for await (const chunk of response) {
        yield chunk.text || '';
      }
    })();
  }
};
