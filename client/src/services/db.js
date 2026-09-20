import Dexie from 'dexie';
import { SEED_MEDICINES, SEED_TESTS, SEED_PRESCRIPTIONS } from './initialData.js';

// Initialize AI-RoSA Offline-First IndexedDB
export const db = new Dexie('AIRoSAHealthNetDB');

db.version(1).stores({
  prescriptions: 'id, rxNumber, date, doctorName, diagnosis',
  reminders: 'id, medicineName, time, period, taken, soundEnabled',
  offlineQueue: '++id, type, payload, queuedAt, status',
  cachedMedicines: 'id, name, genericName, category',
  cachedTests: 'id, name, category',
  userProfile: 'phone, name, bloodGroup',
  sosAlerts: 'alertId, timestamp, status'
});

// Seed Initial Reminders and Catalog if empty
export const seedInitialData = async () => {
  try {
    const reminderCount = await db.reminders.count();
    if (reminderCount === 0) {
      await db.reminders.bulkAdd([
        {
          id: 'rem-1',
          medicineName: 'Telmisartan 40mg',
          purpose: 'Blood Pressure Control',
          dosage: '1 Tablet',
          time: '08:00 AM',
          period: 'Morning',
          instruction: 'After breakfast with warm water',
          taken: false,
          soundEnabled: true
        },
        {
          id: 'rem-2',
          medicineName: 'Calcium 500mg + Vit D3',
          purpose: 'Knee Joint Strength',
          dosage: '1 Tablet',
          time: '01:30 PM',
          period: 'Afternoon',
          instruction: 'After lunch',
          taken: false,
          soundEnabled: true
        },
        {
          id: 'rem-3',
          medicineName: 'Metformin 500mg SR',
          purpose: 'Blood Sugar Control',
          dosage: '1 Tablet',
          time: '08:30 PM',
          period: 'Night',
          instruction: 'Right after dinner',
          taken: false,
          soundEnabled: true
        },
        {
          id: 'rem-4',
          medicineName: 'Knee Mobility Exercise',
          purpose: 'Physical Therapy',
          dosage: '15 Mins Walk & Leg Flexion',
          time: '05:00 PM',
          period: 'Evening',
          instruction: 'Gentle walking in courtyard',
          taken: false,
          soundEnabled: true
        }
      ]);
    }

    const rxCount = await db.prescriptions.count();
    if (rxCount === 0) {
      await db.prescriptions.bulkAdd(SEED_PRESCRIPTIONS);
    }

    const medCount = await db.cachedMedicines.count();
    if (medCount === 0) {
      await db.cachedMedicines.bulkAdd(SEED_MEDICINES);
    }

    const testCount = await db.cachedTests.count();
    if (testCount === 0) {
      await db.cachedTests.bulkAdd(SEED_TESTS);
    }

    console.log('[AI-RoSA DB] All initial health records and catalogs seeded into IndexedDB');
  } catch (err) {
    console.error('[AI-RoSA DB] Seed error:', err);
  }
};

// Queue an action to be executed when back online
export const queueOfflineAction = async (type, payload) => {
  const queuedItem = {
    type,
    payload,
    queuedAt: new Date().toISOString(),
    status: 'PENDING_SYNC'
  };
  const id = await db.offlineQueue.add(queuedItem);
  console.log(`[AI-RoSA Offline Queue] Stored action ${type} (ID: ${id})`);
  return id;
};

// Get all pending offline actions
export const getPendingQueue = async () => {
  return await db.offlineQueue.where('status').equals('PENDING_SYNC').toArray();
};

// Mark item as synced or remove from queue
export const markQueueSynced = async (id) => {
  return await db.offlineQueue.delete(id);
};
