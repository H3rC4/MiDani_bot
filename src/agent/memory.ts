import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config/env.js';
import fs from 'fs';

// Initialize Firebase Admin only once
if (getApps().length === 0) {
  try {
    let serviceAccount;
    // Soporte para nube (Render): lee el JSON directo de una variable de entorno
    if (process.env.FIREBASE_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
    } 
    // Soporte local: lee el archivo que descargaste
    else if (fs.existsSync(config.GOOGLE_APPLICATION_CREDENTIALS)) {
      serviceAccount = JSON.parse(fs.readFileSync(config.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    }

    if (serviceAccount) {
      const projectId = serviceAccount.project_id;
      
      // La URL por defecto suele ser projectId-default-rtdb o solo projectId
      // Puedes ajustarla en el .env si Firebase te asigna una URL diferente
      const databaseURL = process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;

      initializeApp({
        credential: cert(serviceAccount),
        databaseURL
      });
    } else {
      initializeApp();
    }
  } catch (e) {
    console.warn("Failed to initialize Firebase:", e);
    initializeApp();
  }
}

const db = getFirestore();

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export const memory = {
  async addMessage(userId: number, role: Message['role'], content: string) {
    const chatRef = db.collection('chats').doc(userId.toString()).collection('messages');
    await chatRef.add({
      role,
      content,
      timestamp: new Date()
    });
  },
  
  async getHistory(userId: number, limit: number = 50): Promise<Message[]> {
    const chatRef = db.collection('chats').doc(userId.toString()).collection('messages');
    const snapshot = await chatRef.orderBy('timestamp', 'desc').limit(limit).get();
    
    const messages: Message[] = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      messages.unshift({
        role: data.role as Message['role'],
        content: data.content
      });
    });
    return messages;
  },

  async clearHistory(userId: number) {
    const chatRef = db.collection('chats').doc(userId.toString()).collection('messages');
    const snapshot = await chatRef.get();
    
    if (snapshot.empty) return;

    // Batch delete
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
};
