import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { AIService, ChatMessage } from '../types/types';

const cerebras = new Cerebras();

export const cerebrasService: AIService = {
  name: 'Cerebras',
  async chat(messages: ChatMessage[]) {
    const stream = await cerebras.chat.completions.create({
      messages: messages as any,
      model: 'qwen-3-235b-a22b-instruct-2507',
      max_completion_tokens: 40960,
      temperature: 0.6,
      top_p: 0.95,
      stream: true
    }) as any;

    return (async function* () {
      for await (const chunk of stream) {
        yield (chunk.choices[0]?.delta as any)?.content || '';
      }
    })();
  }
};
