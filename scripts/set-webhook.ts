import { Bot } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // E.g., https://your-app.vercel.app/api/webhook

async function setWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
    process.exit(1);
  }

  if (!WEBHOOK_URL) {
    console.error("❌ WEBHOOK_URL is missing. Please provide it as an environment variable.");
    console.log("Usage: WEBHOOK_URL=https://your-app.vercel.app/api/webhook npm run set-webhook");
    process.exit(1);
  }

  const bot = new Bot(TELEGRAM_BOT_TOKEN);
  
  try {
    console.log(`Setting webhook to: ${WEBHOOK_URL}...`);
    await bot.api.setWebhook(WEBHOOK_URL);
    console.log("✅ Webhook set successfully!");
    
    const info = await bot.api.getWebhookInfo();
    console.log("Webhook Info:", info);
  } catch (error) {
    console.error("❌ Failed to set webhook:", error);
    process.exit(1);
  }
}

setWebhook();
