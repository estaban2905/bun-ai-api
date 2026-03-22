import type { AIService, ChatMessage} from "./types/types";
import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import { geminiService } from "./services/gemini";

const services: AIService[] = [
  groqService,
  cerebrasService,
  geminiService
]

let currentServiceIndex = 0

function getNextService() {
  const service = services[currentServiceIndex]
  currentServiceIndex = (currentServiceIndex + 1) % services.length
  return service;
} 

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    if (req.method === 'POST' && pathname === '/chat') {
      const { messages } = await req.json() as { messages: ChatMessage[] };

      for (let i = 0; i < services.length; i++) {
        const service = getNextService();
        console.log(`Using service: ${service?.name}`)
        try {
          const stream = await service?.chat(messages)
          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (err: any) {
          console.error(`Service ${service?.name} failed: ${err?.message ?? err}`)
        }
      }

      return new Response("All services failed", { status: 503 });
    }

    if (req.method === 'GET' && pathname === '/') {
      return new Response(Bun.file(import.meta.dir + '/public/index.html'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return new Response("Not found", { status: 404 });
  }
})

console.log(`Server is running on ${server.url}`)