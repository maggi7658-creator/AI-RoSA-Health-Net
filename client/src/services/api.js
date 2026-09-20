// API client with automated offline fallback and queueing
import { db, queueOfflineAction } from './db.js';
import { SEED_MEDICINES, SEED_TESTS, SEED_PRESCRIPTIONS } from './initialData.js';

const API_BASE = '/api';

export const api = {
  // 1. Triage AI Analysis
  async analyzeSymptoms(data, isOffline = false) {
    if (isOffline) {
      // Local fallback heuristic for offline triage
      const text = (data.symptoms || "").toLowerCase();
      const isEmergency = text.includes("chest") || text.includes("heart") || text.includes("breath");
      return {
        success: true,
        offlineMode: true,
        severity: isEmergency ? "CRITICAL_EMERGENCY" : "MILD",
        severityColor: isEmergency ? "#FF3333" : "#10B981",
        urgencyLevel: isEmergency ? "Emergency SOS Trigger Recommended" : "Mild - Local First-Aid Mode",
        suspectedCondition: isEmergency ? "Acute Cardiovascular / Respiratory Distress" : "Common Seasonal Symptom (Cached)",
        conditionSummary: "Offline Local Engine: Data processed without active internet. Keep patient seated, calm and hydrated.",
        immediateCare: [
          "Sit patient upright in a ventilated place.",
          "Offer small sips of clean warm water.",
          "Rest without exertion. If breathing gets hard, trigger SOS immediately."
        ],
        recommendedAction: isEmergency ? "EMERGENCY_SOS" : "CONSULT_DOCTOR",
        doctorSpecialty: "General Physician / Geriatrician",
        otcMedication: "Generic Paracetamol 500mg (if feverish). Safe for seniors.",
        suggestedTests: ["Basic Vitals Check"],
        disclaimer: "Processed via on-device offline emergency cache."
      };
    }

    try {
      const res = await fetch(`${API_BASE}/triage/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] Triage network failed, falling back to offline analysis:', err);
      return api.analyzeSymptoms(data, true);
    }
  },

  // 2. Doctors & Tele-Consult
  async getDoctors(params = {}, isOffline = false) {
    try {
      if (!isOffline) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/doctors?${query}`);
        if (res.ok) {
          const data = await res.json();
          return data.doctors;
        }
      }
    } catch (err) {
      console.warn('[API] Doctors fetch failed, loading local cache:', err);
    }

    // Offline fallback doctors
    return [
      {
        id: "doc-1",
        name: "Dr. Rajeshwar Sharma",
        qualification: "MBBS, MD (Geriatric Medicine)",
        specialty: "Geriatrician & General Physician",
        experience: "24 Years",
        rating: 4.9,
        reviewsCount: 312,
        languages: ["Hindi", "English", "Punjabi"],
        consultationFee: 199,
        verified: true,
        hospital: "Apex Senior Care & Rural Outreach Clinic",
        availability: "Available Offline Cache",
        nextSlot: "Instant Voice Consultation",
        about: "Specializes in chronic age-related multi-morbidity, hypertension, arthritis, and gentle polypharmacy review."
      },
      {
        id: "doc-2",
        name: "Dr. Ananya Roy",
        qualification: "MBBS, MD (General Medicine)",
        specialty: "General Physician & Diabetologist",
        experience: "16 Years",
        rating: 4.8,
        reviewsCount: 245,
        languages: ["Bengali", "Hindi", "English"],
        consultationFee: 149,
        verified: true,
        hospital: "Shanti Gramin Telemedicine Hospital",
        availability: "Available Offline Cache",
        nextSlot: "Available",
        about: "Passionate about affordable rural healthcare, diabetes reversal counseling, and accessible tele-triage."
      }
    ];
  },

  async bookDoctor(bookingData, isOffline = false) {
    if (isOffline) {
      const queueId = await queueOfflineAction('BOOK_APPOINTMENT', bookingData);
      return {
        success: true,
        offlineQueued: true,
        message: "Saved to Offline Sync Queue! Will confirm once connectivity is restored.",
        appointment: {
          id: `apt-offline-${Date.now().toString().slice(-4)}`,
          ...bookingData,
          status: "QUEUED_OFFLINE",
          roomId: `rosa-offline-room-${Date.now().toString().slice(-4)}`
        }
      };
    }

    try {
      const res = await fetch(`${API_BASE}/doctors/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err) {
      return api.bookDoctor(bookingData, true);
    }
  },

  // 3. Digital Prescriptions
  async getPrescriptions(isOffline = false) {
    try {
      if (!isOffline) {
        const res = await fetch(`${API_BASE}/doctors/prescriptions`);
        if (res.ok) {
          const data = await res.json();
          // Cache in IndexedDB
          for (const rx of data.prescriptions) {
            await db.prescriptions.put(rx);
          }
          return data.prescriptions;
        }
      }
    } catch (err) {
      console.warn('[API] Prescriptions fetch failed, loading IndexedDB');
    }

    const localRxs = await db.prescriptions.toArray();
    return localRxs.length > 0 ? localRxs : SEED_PRESCRIPTIONS;
  },

  async issuePrescription(rxData, isOffline = false) {
    if (isOffline) {
      const localId = `rx-local-${Date.now().toString().slice(-4)}`;
      const newRx = {
        id: localId,
        rxNumber: `RX-ROSA-LOCAL-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split("T")[0],
        ...rxData,
        qrCodeData: `AI-ROSA-LOCAL-RX:${localId}:${rxData.diagnosis}`,
        audioAdvice: `Prescription issued offline for ${rxData.patientName}. Take medications on schedule.`
      };
      await db.prescriptions.put(newRx);
      await queueOfflineAction('ISSUE_PRESCRIPTION', newRx);
      return { success: true, prescription: newRx, offline: true };
    }

    try {
      const res = await fetch(`${API_BASE}/doctors/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rxData)
      });
      const data = await res.json();
      if (data.prescription) {
        await db.prescriptions.put(data.prescription);
      }
      return data;
    } catch (err) {
      return api.issuePrescription(rxData, true);
    }
  },

  // 4. Pharmacy & Generic Price Comparison
  async getMedicines(params = {}, isOffline = false) {
    try {
      if (!isOffline) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/pharmacy/medicines?${query}`);
        if (res.ok) {
          const data = await res.json();
          for (const m of data.medicines) {
            await db.cachedMedicines.put(m);
          }
          return data.medicines;
        }
      }
    } catch (err) {
      console.warn('[API] Pharmacy fetch failed, loading cached medicines');
    }

    const cached = await db.cachedMedicines.toArray();
    return cached.length > 0 ? cached : SEED_MEDICINES;
  },

  async orderMedicine(orderData, isOffline = false) {
    if (isOffline) {
      await queueOfflineAction('ORDER_MEDICINE', orderData);
      return {
        success: true,
        offlineQueued: true,
        message: "Order placed in Offline Queue. Local pharmacy will receive it automatically upon reconnect."
      };
    }

    try {
      const res = await fetch(`${API_BASE}/pharmacy/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await res.json();
    } catch (err) {
      return api.orderMedicine(orderData, true);
    }
  },

  // 5. Diagnostic Labs
  async getDiagnosticTests(params = {}, isOffline = false) {
    try {
      if (!isOffline) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/diagnostics/tests?${query}`);
        if (res.ok) {
          const data = await res.json();
          for (const t of data.tests) {
            await db.cachedTests.put(t);
          }
          return data.tests;
        }
      }
    } catch (err) {
      console.warn('[API] Diagnostics fetch failed, loading cached tests');
    }

    const cached = await db.cachedTests.toArray();
    return cached.length > 0 ? cached : SEED_TESTS;
  },

  async bookDiagnostic(bookingData, isOffline = false) {
    if (isOffline) {
      await queueOfflineAction('BOOK_DIAGNOSTIC', bookingData);
      return {
        success: true,
        offlineQueued: true,
        message: "Home collection booked offline! Scheduled for sync upon network return."
      };
    }

    try {
      const res = await fetch(`${API_BASE}/diagnostics/book-collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err) {
      return api.bookDiagnostic(bookingData, true);
    }
  },

  // 6. Emergency SOS Alert
  async triggerSOS(alertData, isOffline = false) {
    const alertId = `SOS-OFFLINE-${Date.now()}`;
    const localRecord = {
      alertId,
      timestamp: new Date().toISOString(),
      ...alertData,
      status: isOffline ? 'QUEUED_FOR_SMS_DISPATCH' : 'DISPATCHED_ACTIVE'
    };

    await db.sosAlerts.put(localRecord);

    if (isOffline) {
      await queueOfflineAction('EMERGENCY_SOS', localRecord);
      return {
        success: true,
        offlineMode: true,
        message: "⚠️ SOS Stored Locally in Offline Safety Vault. Emergency SMS links prepared for direct SMS app!",
        alert: localRecord
      };
    }

    try {
      const res = await fetch(`${API_BASE}/sos/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
      return await res.json();
    } catch (err) {
      return api.triggerSOS(alertData, true);
    }
  },

  // 7. Sync Batch
  async batchSync(queueItems) {
    const res = await fetch(`${API_BASE}/sync/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue: queueItems })
    });
    return await res.json();
  },

  // 8. Auth
  async sendOtp(phone) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  },

  async verifyOtp(phone, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    return await res.json();
  }
};
