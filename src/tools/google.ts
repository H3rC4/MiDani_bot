import { spawn } from 'child_process';

/**
 * Execute gog CLI safely avoiding shell injection
 */
async function runGog(args: string[]): Promise<string> {
  return new Promise((resolve) => {
    // Inject --no-input so the CLI doesn't hang waiting for user prompts
    const proc = spawn('gog', [...args, '--no-input']);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data.toString());
    proc.stderr.on('data', data => stderr += data.toString());

    proc.on('close', code => {
      if (code === 0) resolve(stdout || "Executed successfully");
      else resolve(`Command Error (Code ${code}): ${stderr || stdout}`);
    });
    
    proc.on('error', err => resolve(`Failed to start gog CLI. Ensure it is installed and in your PATH. Error: ${err.message}`));
  });
}

// ---------------- GMAIL ----------------
export const gmail_search = {
  name: "gmail_search",
  description: "Busca correos en Gmail usando sintaxis de Gmail. Retorna una lista de mensajes individuales.",
  schema: {
    type: "object",
    properties: {
      query: { type: "string", description: 'Búsqueda (e.g. "in:inbox is:unread", "from:ejemplo.com")' },
      max: { type: "number", description: "Máximo número de correos (defecto 10)" }
    },
    required: ["query"]
  },
  execute: async (args: any) => {
    const limit = args.max ? args.max.toString() : "10";
    return runGog(['gmail', 'messages', 'search', args.query, '--max', limit, '--json']);
  }
};

export const gmail_send = {
  name: "gmail_send",
  description: "Envía un correo desde la cuenta de Gmail autorizada.",
  schema: {
    type: "object",
    properties: {
      to: { type: "string" },
      subject: { type: "string" },
      body: { type: "string", description: "Contenido del mensaje" },
      isHtml: { type: "boolean", description: "Marca en true si envías etiquetas HTML en el body" }
    },
    required: ["to", "subject", "body"]
  },
  execute: async (args: any) => {
    const cmdArgs = ['gmail', 'send', '--to', args.to, '--subject', args.subject];
    if (args.isHtml) cmdArgs.push('--body-html', args.body);
    else cmdArgs.push('--body', args.body);
    return runGog(cmdArgs);
  }
};

// ---------------- CALENDAR ----------------
export const calendar_list = {
  name: "calendar_list",
  description: "Devuelve todos los eventos de calendario de la persona en el lapso indicado.",
  schema: {
    type: "object",
    properties: {
      calendarId: { type: "string", description: "Usa 'primary' por defecto" },
      fromIso: { type: "string", description: "Fecha inicio (ISO string, ej 2026-03-21T00:00:00Z)" },
      toIso: { type: "string", description: "Fecha fin (ISO string)" }
    },
    required: ["fromIso", "toIso"]
  },
  execute: async (args: any) => {
    const calId = args.calendarId || 'primary';
    return runGog(['calendar', 'events', calId, '--from', args.fromIso, '--to', args.toIso, '--json']);
  }
};

export const calendar_create = {
  name: "calendar_create",
  description: "Crea un nuevo evento en Google Calendar.",
  schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "Título de la reunión" },
      fromIso: { type: "string", description: "Inicio en formato ISO" },
      toIso: { type: "string", description: "Fin en formato ISO" }
    },
    required: ["summary", "fromIso", "toIso"]
  },
  execute: async (args: any) => {
    return runGog(['calendar', 'create', 'primary', '--summary', args.summary, '--from', args.fromIso, '--to', args.toIso]);
  }
};

// ---------------- DRIVE ----------------
export const drive_search = {
  name: "drive_search",
  description: "Busca archivos en Google Drive",
  schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Nombre del archivo o consulta" },
      max: { type: "number" }
    },
    required: ["query"]
  },
  execute: async (args: any) => {
    const limit = args.max ? args.max.toString() : "10";
    return runGog(['drive', 'search', args.query, '--max', limit, '--json']);
  }
};

// ---------------- CONTACTS ----------------
export const contacts_list = {
  name: "contacts_list",
  description: "Obtiene una lista de los contactos de Google",
  schema: {
    type: "object",
    properties: { max: { type: "number" } },
    required: []
  },
  execute: async (args: any) => {
    const limit = args.max ? args.max.toString() : "20";
    return runGog(['contacts', 'list', '--max', limit, '--json']);
  }
};

// ---------------- SHEETS ----------------
export const sheets_get = {
  name: "sheets_get",
  description: "Extrae valores desde un archivo de Google Sheets",
  schema: {
    type: "object",
    properties: {
      sheetId: { type: "string" },
      range: { type: "string", description: "ej: 'Hoja1!A1:D10'" }
    },
    required: ["sheetId", "range"]
  },
  execute: async (args: any) => {
    return runGog(['sheets', 'get', args.sheetId, args.range, '--json']);
  }
};

// ---------------- DOCS ----------------
export const docs_cat = {
  name: "docs_cat",
  description: "Extrae el texto completo de un documento de Google Docs.",
  schema: {
    type: "object",
    properties: { docId: { type: "string" } },
    required: ["docId"]
  },
  execute: async (args: any) => {
    return runGog(['docs', 'cat', args.docId]);
  }
};
