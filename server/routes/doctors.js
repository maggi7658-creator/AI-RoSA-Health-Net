import express from "express";
import { DOCTORS, INITIAL_PRESCRIPTIONS } from "../data/mockData.js";

const router = express.Router();

let prescriptionsStore = [...INITIAL_PRESCRIPTIONS];
let appointmentsStore = [
  {
    id: "apt-101",
    doctorId: "doc-1",
    doctorName: "Dr. Rajeshwar Sharma",
    specialty: "Geriatrician",
    patientName: "Rameshwar Patel",
    patientPhone: "9876543210",
    date: "2026-09-20",
    timeSlot: "12:30 PM",
    status: "CONFIRMED",
    roomId: "rosa-room-doc1-apt101",
    symptoms: "Mild knee joint stiffness and morning BP checkup"
  }
];

// 1. Get All Verified Doctors
router.get("/", (req, res) => {
  const { specialty, language } = req.query;
  let filtered = [...DOCTORS];

  if (specialty && specialty !== "All") {
    filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }

  if (language && language !== "All") {
    filtered = filtered.filter(d => d.languages.some(l => l.toLowerCase() === language.toLowerCase()));
  }

  return res.json({
    success: true,
    total: filtered.length,
    doctors: filtered
  });
});

// 2. Book Doctor Consultation
router.post("/book", (req, res) => {
  const { doctorId, patientName, patientPhone, date, timeSlot, symptoms } = req.body;

  const doctor = DOCTORS.find(d => d.id === doctorId) || DOCTORS[0];
  const newAppointment = {
    id: `apt-${Date.now().toString().slice(-4)}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    patientName: patientName || "Elderly Patient",
    patientPhone: patientPhone || "9876543210",
    date: date || new Date().toISOString().split("T")[0],
    timeSlot: timeSlot || "Next Available Slot",
    status: "CONFIRMED",
    roomId: `rosa-room-${doctor.id}-${Date.now().toString().slice(-4)}`,
    symptoms: symptoms || "General Consultation",
    consultationFee: doctor.consultationFee,
    createdAt: new Date().toISOString()
  };

  appointmentsStore.unshift(newAppointment);

  return res.json({
    success: true,
    message: "Consultation booked successfully with verified doctor",
    appointment: newAppointment
  });
});

// 3. Get Appointments for Patient
router.get("/appointments", (req, res) => {
  const { phone } = req.query;
  const list = phone 
    ? appointmentsStore.filter(a => a.patientPhone.includes(phone))
    : appointmentsStore;
  return res.json({ success: true, appointments: list });
});

// 4. Get Digital Prescriptions
router.get("/prescriptions", (req, res) => {
  return res.json({
    success: true,
    prescriptions: prescriptionsStore
  });
});

// 5. Issue New Digital Prescription (e.g. from WebRTC consultation)
router.post("/prescriptions", (req, res) => {
  const {
    doctorName = "Dr. Rajeshwar Sharma",
    doctorSpecialty = "Geriatric Medicine",
    doctorReg = "MCI-48201",
    patientName = "Rameshwar Patel (Age: 68)",
    diagnosis,
    medicines = [],
    dietaryAdvice = "Take light meals, drink plenty of water, monitor vitals.",
    vitals = { bp: "130/80 mmHg", pulse: "74 bpm", spO2: "98%" }
  } = req.body;

  const rxId = `rx-${Math.floor(1000 + Math.random() * 9000)}`;
  const rxNumber = `RX-ROSA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRx = {
    id: rxId,
    rxNumber,
    date: new Date().toISOString().split("T")[0],
    doctorName,
    doctorReg,
    doctorSpecialty,
    patientName,
    diagnosis: diagnosis || "Seasonal viral fever with fatigue",
    vitals,
    medicines: medicines.length > 0 ? medicines : [
      {
        name: "Paracetamol 500mg (Generic Jan Aushadhi)",
        dosage: "1 tablet 3 times a day",
        timing: "After meals with warm water",
        duration: "3 Days",
        instructions: "For temperature above 99.5°F. Rest well."
      },
      {
        name: "Cetirizine 10mg (Generic)",
        dosage: "1 tablet once daily",
        timing: "At bedtime",
        duration: "3 Days",
        instructions: "For sneezing and runny nose. Drink warm ginger tea."
      }
    ],
    dietaryAdvice,
    followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    qrCodeData: `AI-ROSA-VERIFIED:${rxNumber}:${doctorName}:${diagnosis}`,
    audioAdvice: `Hello ${patientName}. This is your digital prescription from ${doctorName}. Diagnosis: ${diagnosis}. Please take the medicines on time as specified. Eat light, warm food and drink boiled water.`
  };

  prescriptionsStore.unshift(newRx);

  return res.json({
    success: true,
    message: "Digital prescription generated with verified signature",
    prescription: newRx
  });
});

export default router;
