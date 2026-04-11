import { bot } from '../src/bot/telegram.js';
import { webhookCallback } from 'grammy';

export default webhookCallback(bot, 'https' as any);
