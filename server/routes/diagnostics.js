import express from "express";
import { DIAGNOSTIC_TESTS } from "../data/mockData.js";

const router = express.Router();

let diagnosticBookingsStore = [
  {
    bookingId: "LAB-BK-7721",
    testName: "Senior Citizen Comprehensive Health Package",
    patientName: "Rameshwar Patel",
    patientAge: 68,
    phone: "9876543210",
    address: "House 14, Ward 3, Rampur Village",
    bookingDate: "2026-09-22",
    timeSlot: "07:30 AM - 08:30 AM (Fasting)",
    doorstepSampleCollection: true,
    phlebotomistAssigned: "Rakesh Verma (Verified Lab Tech)",
    phlebotomistContact: "+91 98222 33445",
    totalAmount: 699,
    marketPrice: 2200,
    savings: 1501,
    status: "SCHEDULED_CONFIRMED"
  }
];

// 1. Get Diagnostic Tests & Packages
router.get("/tests", (req, res) => {
  const { category, query } = req.query;
  let list = [...DIAGNOSTIC_TESTS];

  if (category && category !== "All") {
    list = list.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.testsIncluded.some(item => item.toLowerCase().includes(q))
    );
  }

  return res.json({
    success: true,
    count: list.length,
    tests: list
  });
});

// 2. Book Doorstep Sample Collection
router.post("/book-collection", (req, res) => {
  const {
    testId,
    patientName,
    patientAge,
    phone,
    address,
    preferredDate,
    preferredTimeSlot,
    specialAssistanceForSenior = true
  } = req.body;

  const test = DIAGNOSTIC_TESTS.find(t => t.id === testId) || DIAGNOSTIC_TESTS[0];
  const bookingId = `LAB-BK-${Math.floor(1000 + Math.random() * 9000)}`;

  const booking = {
    bookingId,
    testName: test.name,
    testsIncluded: test.testsIncluded,
    patientName: patientName || "Rameshwar Patel",
    patientAge: patientAge || 68,
    phone: phone || "9876543210",
    address: address || "Rampur Village, Dist. Varanasi",
    bookingDate: preferredDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: preferredTimeSlot || "07:30 AM - 08:30 AM (Morning Fasting)",
    doorstepSampleCollection: true,
    phlebotomistAssigned: "Suresh Meena (Certified Phlebotomist)",
    phlebotomistContact: "+91 98333 44556",
    totalAmount: test.rosaDiscountPrice,
    marketPrice: test.avgMarketPrice,
    savings: test.avgMarketPrice - test.rosaDiscountPrice,
    fastingRequired: test.fastingRequired,
    prepInstructions: test.prepInstructions,
    specialAssistanceForSenior,
    status: "SCHEDULED_CONFIRMED",
    createdAt: new Date().toISOString()
  };

  diagnosticBookingsStore.unshift(booking);

  return res.json({
    success: true,
    message: "Doorstep sample collection booked. Our healthcare technician will visit your home.",
    booking
  });
});

// 3. Get Patient Lab Bookings
router.get("/bookings", (req, res) => {
  return res.json({
    success: true,
    bookings: diagnosticBookingsStore
  });
});

export default router;
