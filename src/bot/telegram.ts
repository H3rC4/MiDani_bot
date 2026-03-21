import { Bot, InputFile } from 'grammy';
import { config } from '../config/env.js';
import { authMiddleware } from './auth.js';
import { runAgentLoop } from '../agent/loop.js';
import { memory } from '../agent/memory.js';
import { transcribeAudio, generateAudio } from '../agent/llm.js';

if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'SUTITUYE POR EL TUYO') {
  console.error("TELEGRAM_BOT_TOKEN is missing or invalid");
  process.exit(1);
}

export const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// Apply auth middleware to all messages
bot.use(authMiddleware);

bot.command("start", async (ctx) => {
  await ctx.reply("¡Hola! Soy Daniela, tu asistente personal. ¿En qué te puedo ayudar hoy?");
});

bot.command("clear", async (ctx) => {
  if (!ctx.from) return;
  await memory.clearHistory(ctx.from.id);
  await ctx.reply("🧹 Memoria borrada. Empecemos de nuevo.");
});

bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;
  const userText = ctx.message.text;

  // Send typing indicator
  await ctx.replyWithChatAction("typing");

  try {
    const response = await runAgentLoop(userId, userText);
    await ctx.reply(response);
  } catch (error: any) {
    console.error("Error running agent loop:", error);
    await ctx.reply(`❌ Ocurrió un error en mi procesamiento cognitivo: ${error.message}`);
  }
});

bot.on(["message:voice", "message:audio"], async (ctx) => {
  const userId = ctx.from.id;
  await ctx.replyWithChatAction("typing");

  try {
    const fileId = ctx.message.voice ? ctx.message.voice.file_id : ctx.message.audio?.file_id;
    if (!fileId) return;

    const file = await ctx.api.getFile(fileId);
    if (!file.file_path) {
      await ctx.reply("❌ No pude acceder al archivo de audio.");
      return;
    }

    const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribir con Groq Whisper
    const text = await transcribeAudio(buffer, "audio.ogg");

    await ctx.reply(`🎤 *Te escuché decir:* "${text}"`, { parse_mode: "Markdown" });

    // Procesarlo con el agente igual que un mensaje de texto
    const aiResponse = await runAgentLoop(userId, text);
    await ctx.reply(aiResponse);

    // Responder con voz si ElevenLabs está configurado
    if (config.ELEVENLABS_API_KEY) {
      await ctx.replyWithChatAction("record_voice");
      try {
        const audioBuffer = await generateAudio(aiResponse);
        // Enviamos el audio como "nota de voz"
        await ctx.replyWithVoice(new InputFile(audioBuffer, "daniela.mp3"));
      } catch (err: any) {
        console.error("TTS error:", err);
        await ctx.reply("❌ Error generando mi voz: " + err.message);
      }
    }

  } catch (error: any) {
    console.error("Audio processing error:", error);
    await ctx.reply(`❌ Ocurrió un error al procesar tu audio: ${error.message}`);
  }
});

export async function startBot() {
  console.log("Starting Telegram Bot...");
  await bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} started successfully.`);
    }
  });
}
