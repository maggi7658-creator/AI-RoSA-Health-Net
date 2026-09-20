# AI-RoSA Health-Net 🏥⚡

> **Multilingual, Offline-First Healthcare Progressive Web App (PWA) designed for Rural Communities & Elderly Citizens.**  
> Built with **Neobrutalism UI in Light Theme**, High-Contrast Senior Accessibility Controls, Voice AI (Speech-to-Text & TTS), WebRTC Teleconsultation, and One-Touch Emergency SOS.

### 🌐 [Live Public Web App](https://maggi7658-creator.github.io/AI-RoSA-Health-Net/) • 📱 Installable PWA • 💾 Offline-First

---

## 🌟 Key Innovations & Features

### 1. 🎨 Neobrutalism UI in Light Theme
- **Senior-Friendly Aesthetic**: Warm parchment background (`#FFFDF6`), stark high-contrast borders (`3px - 4px solid #000000`), and tactile hard drop shadows (`shadow-[5px_5px_0px_0px_#000]`).
- **Tactile Affordance**: Buttons visibly depress on click/tap (`active:translate-x-1 active:translate-y-1 active:shadow-none`).
- **Senior Font Zoom Switcher**: 1-click toggling between `Normal (16px)`, `Large (19px)`, and `Extra Large (22px)` text scales across every screen.

### 2. 🌐 Multilingual Voice AI (Speech-to-Text & Text-to-Speech)
- Instant language switching across **7 languages**:
  - English (`en`)
  - Hindi (`hi` - हिन्दी)
  - Bengali (`bn` - বাংলা)
  - Telugu (`te` - తెలుగు)
  - Tamil (`ta` - தமிழ்)
  - Marathi (`mr` - मराठी)
  - Spanish (`es` - Español)
- **Voice Symptom Input**: Speak symptoms aloud using Web Speech API with live dictation.
- **Voice Read-Aloud (TTS)**: 1-click audio read-out of medical advice, digital prescriptions, and pill reminders for illiterate or visually-impaired seniors.

### 3. 💾 Offline-First Architecture & IndexedDB Sync
- **Local Persistence via Dexie.js (IndexedDB)**: Prescriptions, scheduled pill reminders, cached generic medicines, and user health profile are stored on-device.
- **Simulate Offline Mode Toggle**: Easily test zero-network rural scenarios directly from the header status badge (`⚡ ONLINE` / `⚠️ OFFLINE MODE`).
- **Offline Action Queue**: Consultations, SOS broadcasts, and medicine logs made offline are queued locally and automatically synced with the central server upon reconnection.

### 4. 🚨 Emergency SOS with GPS & SMS Dispatch
- **Double-Tap Trigger**: Accessible SOS button with a 3-second cancel countdown.
- **GPS Telemetry**: Captures precise latitude, longitude, and accuracy.
- **Multi-Party Broadcast**: Simulates emergency alerts to:
  - 🚑 108 State Emergency Ambulance Dispatch
  - 🏥 Rural Trauma Clinic & Hospital
  - 🚔 Local Police PCR
  - 👨‍👩‍👧 Nominated Family & Caregiver contacts
- **Native GSM SMS Link**: Prepares direct `sms:108?body=...` link so emergency messages can be sent via traditional SMS even with zero internet data.
- **Audible Siren Tone**: Web Audio API dual-frequency emergency horn.

### 5. 🩺 Verified Doctors & WebRTC Consultation Room
- **Doctor Directory**: Verified geriatricians, general physicians, cardiologists, and dermatologists.
- **Live Consultation Room**: Encrypted simulated WebRTC video feed with self-camera preview, microphone mute, and live chat notes.
- **Digital Prescription Issuance**: Doctor directly generates an official QR-signed digital prescription from the call.

### 6. 📜 Digital QR Prescriptions
- Official medical prescription card with doctor registration number, diagnosis, vitals, and structured medication schedule.
- **"Read Aloud (TTS)" Button**: Patient can listen to dosage instructions in their native language.
- Print & PDF export ready.

### 7. 💊 Pharmacy & Generic Price Comparison
- Compare expensive branded medicines against government-subsidized **Jan Aushadhi Generic alternatives**.
- Clear percentage savings indicators (up to **80% savings**).
- Senior advisory tips for safe usage with food.
- Nearby pharmacy locator with stock status and home delivery.

### 8. 🧪 Diagnostics & Doorstep Sample Collection
- Comprehensive health packages (Senior Citizen Full Body, HbA1c, Lipid, CBC, KFT).
- Free rural doorstep sample collection booking form with gentle phlebotomist senior-care requests.

### 9. ⏰ AI Medicine & Therapy Reminders
- Schedule pill reminders for Morning, Afternoon, Evening, and Night.
- Audio and spoken voice alerts with medication instructions.
- 14-day compliance adherence streak counter.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS (Neobrutalism), Lucide React, Canvas Confetti |
| **Offline Storage** | IndexedDB (Dexie.js), Service Worker (PWA) |
| **Voice AI** | Web Speech API (Recognition + SpeechSynthesis) |
| **Backend** | Node.js, Express.js, REST APIs, CORS, JWT |
| **Communication** | WebRTC Simulation & Socket-ready Consultation Room |
| **Design** | Light Theme Neobrutalism, High Contrast, Elderly Accessibility Scales |

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Start Express Backend
```powershell
cd server
npm install
node server.js
```
*Backend runs on `http://localhost:5000`*

### 2. Start Vite PWA Client
```powershell
cd client
npm install
npm run dev
```
*Client runs on `http://localhost:5173`*

### 3. Run Automated Tests
```powershell
cd server
node test_system.js
```

---

## 📱 PWA Mobile Installation
1. Open `http://localhost:5173` in Chrome or mobile browser.
2. Click **"Add to Home Screen"** or the browser Install icon.
3. Launch **AI-RoSA** as a standalone offline application on any Android or iOS device!
