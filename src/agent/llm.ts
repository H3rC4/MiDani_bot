import { config } from '../config/env.js';
import { toolDefinitions } from '../tools/index.js';
import { Message } from './memory.js';

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
