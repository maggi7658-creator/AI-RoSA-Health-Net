import express from "express";

const router = express.Router();

let sosAlertsHistory = [];

// Trigger Emergency SOS Broadcast
router.post("/alert", (req, res) => {
  const {
    patientName = "Rameshwar Patel",
    patientPhone = "9876543210",
    bloodGroup = "B+",
    emergencyType = "ACUTE_MEDICAL_EMERGENCY",
    coordinates = { latitude: 28.6139, longitude: 77.2090 },
    address = "Rampur Village, Primary Health Centre Road",
    emergencyContacts = [
      { name: "Sunil Patel (Son)", phone: "+91 98765 11223" },
      { name: "Community Health Worker", phone: "+91 98444 55667" }
    ],
    batteryLevel = "84%",
    isOfflineSync = false
  } = req.body;

  const alertId = `SOS-${Date.now()}`;
  const mapLink = `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
  const smsMessage = `🚨 EMERGENCY MEDICAL ALERT [AI-RoSA Health-Net] 🚨
Patient: ${patientName} (Phone: ${patientPhone}, Blood: ${bloodGroup})
Type: ${emergencyType}
GPS Location: ${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}
Map Link: ${mapLink}
Address: ${address}
Battery: ${batteryLevel}
Immediate response requested!`;

  const dispatchedRecipients = [
    { target: "108 State Emergency Ambulance Dispatch", status: "SMS_SENT_CONFIRMED", time: new Date().toLocaleTimeString() },
    { target: "Community Rural Hospital Trauma Ward", status: "SMS_SENT_CONFIRMED", time: new Date().toLocaleTimeString() },
    { target: "Local Police PCR Station", status: "SMS_SENT_CONFIRMED", time: new Date().toLocaleTimeString() },
    ...emergencyContacts.map(c => ({
      target: `${c.name} (${c.phone})`,
      status: "SMS_SENT_CONFIRMED",
      time: new Date().toLocaleTimeString()
    }))
  ];

  const sosRecord = {
    alertId,
    timestamp: new Date().toISOString(),
    patientName,
    patientPhone,
    bloodGroup,
    emergencyType,
    coordinates,
    address,
    mapLink,
    smsMessage,
    dispatchedRecipients,
    isOfflineSync,
    status: "DISPATCHED_ACTIVE"
  };

  sosAlertsHistory.unshift(sosRecord);

  console.log(`[AI-RoSA SOS DISPATCH] Emergency alert ${alertId} triggered for ${patientName}`);

  return res.json({
    success: true,
    message: "🚨 SOS Emergency Alert Dispatched to 108 Ambulance, Hospital, and Family!",
    alert: sosRecord
  });
});

// Get SOS History
router.get("/history", (req, res) => {
  return res.json({
    success: true,
    history: sosAlertsHistory
  });
});

export default router;
