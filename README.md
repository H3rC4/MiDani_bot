# 🪐 OpenGravity - MiDani Telegram Bot

¡Bienvenido al repositorio de **OpenGravity** (MiDani Bot)! Este es un agente de Inteligencia Artificial personalizado construido desde cero para interactuar de forma nativa a través de **Telegram**.

Este proyecto está diseñado para funcionar mediante *Long-Polling* con Telegram, pero incluye un servidor web básico incorporado para poder ser desplegado sin problemas en plataformas en la nube (como Render o Heroku) que requieren que se exponga un puerto web para revisiones de estado (Health Checks).

---

## 🚀 Tecnologías Principales

El bot está desarrollado con un stack moderno basado en el ecosistema de JavaScript/TypeScript:

*   **[Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)**: Lenguaje principal de desarrollo, aportando tipado estático y robustez.
*   **[grammY](https://grammy.dev/)**: Un framework moderno y extremadamente rápido para la API de bots de Telegram.
*   **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)**: Utilizado para la persistencia, base de datos y/o servicios en la nube de Google Firebase.
*   **[Google TTS API](https://github.com/hizmn/google-tts-api)**: Integración para convertir texto a voz (Text-to-Speech) y enviar notas de voz por Telegram.
*   **[tsx](https://github.com/privatenumber/tsx)**: Entorno de ejecución de TypeScript ultrarrápido utilizado para el desarrollo local sin necesidad de compilar previamente.

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes en tu sistema local:

1.  **Node.js**: Versión 18 o superior.
2.  **npm**: Gestor de paquetes (incluido con Node.js).
3.  **Bot Token de Telegram**: Puedes conseguir uno creando un bot con [@BotFather](https://t.me/BotFather) en Telegram.
4.  **Firebase Service Account**: Las credenciales de administrador de Firebase para la comunicación con la base de datos (`service-account.json`).

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para hacer correr el bot en tu máquina local:

### 1. Clonar el repositorio

Si aún no lo has hecho, clona el proyecto en tu entorno local:
```bash
git clone <URL_DEL_REPOSITORIO>
cd openGravity
```

### 2. Instalar dependencias

Instala todos los paquetes requeridos por el proyecto utilizando NPM:
```bash
npm install
```

### 3. Configurar las Variables de Entorno

El proyecto requiere un archivo `.env` en la raíz para almacenar información sensible (claves, tokens). 
Crea un archivo llamado `.env` basándote en lo que necesita tu bot. Usualmente incluye:

```env
# Ejemplo de .env
TELEGRAM_BOT_TOKEN="tu_token_otorgado_por_botfather"
# (Añade aquí otras variables como credenciales de LLMs, puertos, etc, si aplica)
```

### 4. Credenciales de Firebase

Es necesario colocar tu archivo de credenciales de Firebase en la raíz del proyecto.
El archivo debe llamarse **`service-account.json`** y debe contener la clave privada de la cuenta de servicio de Firebase Admin.

---

## 💻 Cómo Hacer Correr el Bot

### Entorno de Desarrollo (Local)

Para arrancar el bot localmente en modo desarrollo con recarga automática al hacer cambios, ejecuta:

```bash
npm run dev
```
*(Esto ejecutará `tsx watch src/index.ts` y te mostrará la salida en la consola).*

### Entorno de Producción

Para preparar y correr la aplicación en un entorno de producción (o para validar que compile correctamente):

1. **Compilar el código TypeScript a JavaScript:**
   ```bash
   npm run build
   ```
2. **Arrancar el servidor de producción:**
   ```bash
   npm start
   ```

---

## ☁️ Despliegue (Deploy)

El proyecto viene listo para ser desplegado en servicios cloud como [Render](https://render.com/). Incluye configuraciones base como el archivo `render.yaml` y un servidor local HTTP (`http.createServer`) en el `index.ts` que escucha el puerto dinámico asignado por el hosting para evitar que el contenedor sea reportado como "caído" (Crashed).

Para desplegarlo:
1. Sube tu código a GitHub.
2. Conecta el repositorio a una plataforma como Render.
3. Asegúrate de configurar los **Environment Variables** (variables de entorno) requeridas y cargar tu `service-account.json` de manera segura (algunos hosts como Render permiten secret files).

---
*Si tienes problemas o preguntas, revisa la documentación de las librerías base (grammY, Firebase).*
