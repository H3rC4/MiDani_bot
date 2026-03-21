import { memory, Message } from './memory.js';
import { checkLLM } from './llm.js';
import { tools } from '../tools/index.js';

const SYSTEM_PROMPT = `Sos Daniela, una asistente de IA personal. Te comunicás con el usuario a través de Telegram.
IMPORTANTE: Debes responder usando el voseo rioplatense (ej. vos, tenés, hacés) con tono cálido, pero NO exageres el acento. Usa la palabra "che" y otras jergas con mucha moderación (reduce su uso al mínimo para sonar natural y no forzada).
Tus respuestas deben ser concisas y útiles. Si alguna vez te comunicás por voz, recordá que tenés voz de mujer.
Tenés acceso a herramientas; usalas cuando sea necesario.`;

export async function runAgentLoop(userId: number, userMessage: string, maxIterations = 5) {
  // First, store the user's message
  await memory.addMessage(userId, 'user', userMessage);
  
  let history = await memory.getHistory(userId);
  
  // Prepend system prompt if not present
  const messagesToContext: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
  ];

  let iterations = 0;
  
  while (iterations < maxIterations) {
    iterations++;
    const llmMessage = await checkLLM(messagesToContext);
    
    // Check if tool call
    if (llmMessage.tool_calls && llmMessage.tool_calls.length > 0) {
      // Add assistant message to context memory
      const storedContent = JSON.stringify({
         content: llmMessage.content || "",
         tool_calls: llmMessage.tool_calls
      });
      await memory.addMessage(userId, 'assistant', storedContent);
      
      // Also add to execution context
      messagesToContext.push(llmMessage);

      // Execute tools
      for (const toolCall of llmMessage.tool_calls) {
        if (toolCall.type === 'function') {
          const fnName = toolCall.function.name;
          const fnArgs = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};
          
          let resultStr = "";
          try {
            if (tools[fnName]) {
              const res = await tools[fnName].execute(fnArgs);
              resultStr = typeof res === 'string' ? res : JSON.stringify(res);
            } else {
              resultStr = `Error: Tool ${fnName} not found.`;
            }
          } catch (e: any) {
            resultStr = `Error executing tool: ${e.message}`;
          }

          const toolMsg = { role: 'tool', tool_call_id: toolCall.id, name: fnName, content: resultStr };
          messagesToContext.push(toolMsg as any);
          await memory.addMessage(userId, 'tool', JSON.stringify(toolMsg));
        }
      }
    } else {
      // Final text response
      const finalContent = llmMessage.content || "Sin respuesta";
      await memory.addMessage(userId, 'assistant', finalContent);
      return finalContent;
    }
  }

  return "⚠️ Alcancé el límite de iteraciones de mis herramientas, por favor formula tu petición de otra manera.";
}
