import { startBot } from './bot/telegram.js';
import http from 'http';

// Servidor web muy básico para engañar a los hosts gratuitos en la nube (ej. Render, Heroku)
// que exigen que la aplicación escuche obligatoriamente un puerto, aunque sea long-polling.
const port = process.env.PORT || (Math.floor(Math.random() * 1000) + 3000);
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Daniela is awake! (OpenGravity Agent)');
});

async function bootstrap() {
  try {
    server.on('error', (e) => console.log('Dummy server port in use (safe to ignore locally).'));
    server.listen(port, () => {
      console.log(`Dummy web server listening on port ${port} for cloud health checks.`);
    });
    // Iniciar el polling de Telegram
    await startBot();
  } catch (error) {
    console.error("Failed to start OpenGravity:", error);
    process.exit(1);
  }
}

bootstrap();
