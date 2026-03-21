import dotenv from 'dotenv';
dotenv.config();

export const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_ALLOWED_USER_IDS: process.env.TELEGRAM_ALLOWED_USER_IDS 
    ? process.env.TELEGRAM_ALLOWED_USER_IDS.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    : [],
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openrouter/free',
  DB_PATH: process.env.DB_PATH || './memory.db',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || ''
};

// Validations
if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN === 'SUTITUYE POR EL TUYO') {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not configured properly.');
}
if (!config.GROQ_API_KEY || config.GROQ_API_KEY === 'SUTITUYE POR EL TUYO') {
  console.warn('Warning: GROQ_API_KEY is not configured properly.');
}
