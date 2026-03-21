import { Bot } from 'grammy';
import { config } from '../config/env.js';
import { authMiddleware } from './auth.js';
import { runAgentLoop } from '../agent/loop.js';
import { memory } from '../agent/memory.js';

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

export async function startBot() {
  console.log("Starting Telegram Bot...");
  await bot.start({
    onStart: (botInfo) => {
      console.log(`Bot @${botInfo.username} started successfully.`);
    }
  });
}
