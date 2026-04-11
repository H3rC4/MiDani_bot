import { Bot } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function deleteWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
    process.exit(1);
  }

  const bot = new Bot(TELEGRAM_BOT_TOKEN);
  
  try {
    console.log("Deleting webhook...");
    await bot.api.deleteWebhook();
    console.log("✅ Webhook deleted successfully! You can now use polling (npm run dev).");
  } catch (error) {
    console.error("❌ Failed to delete webhook:", error);
    process.exit(1);
  }
}

deleteWebhook();
