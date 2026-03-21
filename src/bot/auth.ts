import { Context, NextFunction } from 'grammy';
import { config } from '../config/env.js';

export async function authMiddleware(ctx: Context, next: NextFunction) {
  if (!ctx.from) return;

  const userId = ctx.from.id;
  
  if (config.TELEGRAM_ALLOWED_USER_IDS.length === 0) {
    console.warn(`User ${userId} tried to interact, but no allowed users are configured.`);
    await ctx.reply("⚠️ El bot no tiene usuarios permitidos configurados.");
    return;
  }

  if (!config.TELEGRAM_ALLOWED_USER_IDS.includes(userId)) {
    console.warn(`Unauthorized access attempt from user ${userId}`);
    await ctx.reply("🚫 No tienes autorización para usar este agente.");
    return;
  }

  await next();
}
