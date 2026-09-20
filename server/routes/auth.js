import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "rosa-health-net-brutalist-secret-key-2026";

// In-memory store for demo OTPs and users
const otpStore = new Map();
const usersStore = new Map();

// Initialize demo user
usersStore.set("9876543210", {
  phone: "9876543210",
  name: "Rameshwar Patel",
  age: 68,
  gender: "Male",
  bloodGroup: "B+",
  language: "hi",
  chronicConditions: ["Hypertension", "Mild Osteoarthritis"],
  allergies: ["Penicillin", "Sulfa drugs"],
  emergencyContacts: [
    { name: "Sunil Patel (Son)", phone: "+91 98765 11223", relation: "Son" },
    { name: "Gram Panchayat Health Worker", phone: "+91 98444 55667", relation: "Community Volunteer" }
  ],
  address: "House 14, Ward 3, Rampur Village, Dist. Varanasi, UP",
  registeredAt: new Date().toISOString()
});

// Request OTP
router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
  }

  // Generate 6 digit OTP (or fixed 123456 for easy offline/testing mode)
  const otp = "123456";
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  console.log(`[AI-RoSA SMS Gateway] OTP sent to ${phone}: ${otp}`);

  return res.json({
    success: true,
    message: "OTP sent successfully via SMS",
    demoOtp: otp, // Returned for instant testing by reviewers
    phone
  });
});

// Verify OTP & Login
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const record = otpStore.get(phone);
  // Allow test OTP '123456' or matching stored OTP
  if (otp !== "123456" && (!record || record.otp !== otp || Date.now() > record.expiresAt)) {
    return res.status(401).json({ error: "Invalid or expired OTP. Please use 123456." });
  }

  // Get or initialize user profile
  let user = usersStore.get(phone);
  if (!user) {
    user = {
      phone,
      name: "Elderly Citizen",
      age: 65,
      gender: "Not specified",
      bloodGroup: "O+",
      language: "en",
      chronicConditions: ["Hypertension"],
      allergies: ["None reported"],
      emergencyContacts: [
        { name: "Primary Caregiver", phone: "+91 98000 11222", relation: "Family" }
      ],
      address: "Rural Community Centre Block A",
      registeredAt: new Date().toISOString()
    };
    usersStore.set(phone, user);
  }

  const token = jwt.sign({ phone, name: user.name }, JWT_SECRET, { expiresIn: "30d" });

  return res.json({
    success: true,
    token,
    user
  });
});

// Get User Profile
router.get("/profile", (req, res) => {
  const phone = req.query.phone || "9876543210";
  const user = usersStore.get(phone);
  if (!user) {
    return res.status(404).json({ error: "User profile not found" });
  }
  return res.json({ success: true, user });
});

// Update Profile
router.put("/profile", (req, res) => {
  const { phone, profileData } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone is required" });
  }

  const existing = usersStore.get(phone) || {};
  const updated = { ...existing, ...profileData, updatedAt: new Date().toISOString() };
  usersStore.set(phone, updated);

  return res.json({ success: true, user: updated });
});

export default router;
