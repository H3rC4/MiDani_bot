import { config } from '../config/env.js';
import { toolDefinitions } from '../tools/index.js';
import { Message } from './memory.js';
import * as googleTTS from 'google-tts-api';

export async function generateAudio(text: string): Promise<Buffer> {
  // Transforma el texto largo en pequeños fragmentos base64 usando Google Translate
  const results = await googleTTS.getAllAudioBase64(text, {
    lang: 'es',     // Español
    slow: false,    // Velocidad normal
    host: 'https://translate.google.com',
  });
  
  // Une los fragmentos base64 en un gran buffer de audio mp3
  const buffers = results.map((res: any) => Buffer.from(res.base64, 'base64'));
  return Buffer.concat(buffers);
}

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const isGroq = !!config.GROQ_API_KEY && config.GROQ_API_KEY !== 'SUTITUYE POR EL TUYO';
  if (!isGroq) throw new Error("Se requiere una API Key de Groq para la transcripción de audio.");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg' }), filename);
  // whisper-large-v3-turbo es super rápido, ideal para bots de voz
  formData.append("model", "whisper-large-v3-turbo");

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.GROQ_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de Transcripción (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.text;
}

export async function checkLLM(messages: Message[]) {
  const isGroq = !!config.GROQ_API_KEY && config.GROQ_API_KEY !== 'SUTITUYE POR EL TUYO';
  const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = isGroq ? config.GROQ_API_KEY : config.OPENROUTER_API_KEY;
  const model = isGroq ? 'llama-3.3-70b-versatile' : config.OPENROUTER_MODEL;

  if (!apiKey || apiKey === 'SUTITUYE POR EL TUYO') {
    throw new Error("No API Key configured for LLM (Groq or OpenRouter)");
  }

  // Parse any stored tool calls from JSON strings in memory
  // Since we save assistant tool calls and tool results as stringified JSON in sqlite
  const formattedMessages = messages.map(msg => {
    if (msg.role === 'assistant') {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.tool_calls) {
          return { role: 'assistant', content: parsed.content || null, tool_calls: parsed.tool_calls };
        }
      } catch (e) {
        // Just standard text
      }
      return { role: 'assistant', content: msg.content };
    }
    if (msg.role === 'tool') {
      try {
        const parsed = JSON.parse(msg.content);
        return { role: 'tool', tool_call_id: parsed.tool_call_id, name: parsed.name, content: parsed.content };
      } catch(e) { /* fallback */ }
    }
    return msg;
  });

  const payload = {
    model,
    messages: formattedMessages,
    tools: toolDefinitions,
    tool_choice: "auto"
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(isGroq ? {} : {
        'HTTP-Referer': 'https://github.com/DanielaAgent',
        'X-Title': 'Daniela'
      })
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message;
}
