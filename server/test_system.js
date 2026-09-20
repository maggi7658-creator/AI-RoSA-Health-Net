// Automated System Test Suite for AI-RoSA Health-Net
async function runTests() {
  console.log("==================================================");
  console.log("  AI-RoSA Health-Net Automated Integration Tests  ");
  console.log("==================================================");

  const BASE_URL = "http://localhost:5000/api";
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test("Backend Health Check", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== "healthy") throw new Error("Health check failed");
  });

  // 2. Auth OTP Flow
  await test("Auth OTP Request & Verify", async () => {
    const res1 = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543210" })
    });
    const data1 = await res1.json();
    if (!data1.success) throw new Error("Send OTP failed");

    const res2 = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543210", otp: "123456" })
    });
    const data2 = await res2.json();
    if (!data2.token || !data2.user) throw new Error("Verify OTP failed");
  });

  // 3. AI Triage: Mild Fever
  await test("AI Triage: Mild Fever with Home Care & Generic Rx", async () => {
    const res = await fetch(`${BASE_URL}/triage/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: "Mild fever and headache for 1 day", language: "en" })
    });
    const data = await res.json();
    if (data.severity !== "MILD" || !data.immediateCare) throw new Error("Mild triage check failed");
  });

  // 4. AI Triage: Emergency Red Flag Detection
  await test("AI Triage: Acute Chest Pain triggers Emergency SOS", async () => {
    const res = await fetch(`${BASE_URL}/triage/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: "Severe chest pain and breathless", language: "en" })
    });
    const data = await res.json();
    if (data.severity !== "CRITICAL_EMERGENCY" || data.recommendedAction !== "EMERGENCY_SOS") {
      throw new Error("Emergency triage trigger failed");
    }
  });

  // 5. AI Triage: Dermatological Rash Inspection
  await test("AI Triage: Visual Rash Analysis", async () => {
    const res = await fetch(`${BASE_URL}/triage/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: "Itchy red rash on skin", hasImage: true })
    });
    const data = await res.json();
    if (!data.imageAnalysisResults || !data.imageAnalysisResults.analyzed) {
      throw new Error("Visual rash analysis failed");
    }
  });

  // 6. Verified Doctors Directory
  await test("Doctors Directory & Teleconsult Booking", async () => {
    const res1 = await fetch(`${BASE_URL}/doctors`);
    const data1 = await res1.json();
    if (!data1.doctors || data1.doctors.length === 0) throw new Error("Doctors list empty");

    const res2 = await fetch(`${BASE_URL}/doctors/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: data1.doctors[0].id,
        patientName: "Rameshwar Patel",
        patientPhone: "9876543210"
      })
    });
    const data2 = await res2.json();
    if (!data2.appointment || !data2.appointment.roomId) throw new Error("Booking consultation failed");
  });

  // 7. Digital Prescription Generation
  await test("Digital Prescription Generation with QR Data", async () => {
    const res = await fetch(`${BASE_URL}/doctors/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorName: "Dr. Rajeshwar Sharma",
        patientName: "Rameshwar Patel",
        diagnosis: "Essential Hypertension & Knee Joint Stiffness"
      })
    });
    const data = await res.json();
    if (!data.prescription || !data.prescription.qrCodeData) throw new Error("Prescription issue failed");
  });

  // 8. Pharmacy Generic vs Brand Price Comparison
  await test("Pharmacy: Generic vs Brand Price Comparison", async () => {
    const res = await fetch(`${BASE_URL}/pharmacy/medicines?query=paracetamol`);
    const data = await res.json();
    if (!data.medicines || data.medicines.length === 0) throw new Error("Medicine search failed");
    const med = data.medicines[0];
    if (med.genericPrice >= med.brandPrice) throw new Error("Generic price should be cheaper than brand");
    console.log(`       [Data Check] ${med.name}: Generic ₹${med.genericPrice} vs Brand ₹${med.brandPrice} (Savings: ${med.savingsPercent}%)`);
  });

  // 9. Diagnostics Doorstep Collection Booking
  await test("Diagnostics: Doorstep Sample Collection Booking", async () => {
    const res = await fetch(`${BASE_URL}/diagnostics/book-collection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Rameshwar Patel",
        patientAge: 68,
        address: "Rampur Village"
      })
    });
    const data = await res.json();
    if (!data.booking || !data.booking.bookingId) throw new Error("Diagnostic booking failed");
  });

  // 10. Emergency SOS Broadcast
  await test("Emergency SOS: Broadcast & SMS Notification", async () => {
    const res = await fetch(`${BASE_URL}/sos/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Rameshwar Patel",
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        bloodGroup: "B+"
      })
    });
    const data = await res.json();
    if (!data.alert || !data.alert.alertId || data.alert.dispatchedRecipients.length === 0) {
      throw new Error("SOS alert failed");
    }
  });

  // 11. Batch Offline Sync
  await test("Offline Batch Synchronization", async () => {
    const res = await fetch(`${BASE_URL}/sync/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queue: [
          { type: "BOOK_APPOINTMENT", payload: { doctorId: "doc-1" }, queuedAt: new Date().toISOString() },
          { type: "EMERGENCY_SOS", payload: { coords: "28.61,77.20" }, queuedAt: new Date().toISOString() }
        ]
      })
    });
    const data = await res.json();
    if (data.totalProcessed !== 2) throw new Error("Sync batch failed");
  });

  console.log("==================================================");
  console.log(`  Tests Complete: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTests();
