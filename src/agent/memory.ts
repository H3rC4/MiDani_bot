import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config/env.js';
import fs from 'fs';

// Initialize Firebase Admin only once
if (getApps().length === 0) {
  try {
    if (fs.existsSync(config.GOOGLE_APPLICATION_CREDENTIALS)) {
      const serviceAccount = JSON.parse(fs.readFileSync(config.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      initializeApp(); // Fallback to ADC
    }
  } catch (e) {
    console.warn("Failed to initialize Firebase with specific credentials, falling back to default.", e);
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
