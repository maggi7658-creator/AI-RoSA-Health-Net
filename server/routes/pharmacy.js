import express from "express";
import { MEDICINES, PHARMACIES } from "../data/mockData.js";

const router = express.Router();

let pharmacyOrdersStore = [];

// 1. Search Medicines & Compare Generic vs Brand Prices
router.get("/medicines", (req, res) => {
  const { query, category } = req.query;
  let results = [...MEDICINES];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.brandName.toLowerCase().includes(q) ||
      m.composition.toLowerCase().includes(q)
    );
  }

  if (category && category !== "All") {
    results = results.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
  }

  // Calculate generic savings overview
  const totalSavingsPossible = results.reduce((acc, curr) => acc + (curr.brandPrice - curr.genericPrice), 0);

  return res.json({
    success: true,
    count: results.length,
    medicines: results,
    totalSavingsPossible: Math.round(totalSavingsPossible)
  });
});

// 2. Get Medicine Details by ID
router.get("/medicines/:id", (req, res) => {
  const med = MEDICINES.find(m => m.id === req.params.id);
  if (!med) {
    return res.status(404).json({ error: "Medicine not found in catalog" });
  }
  return res.json({ success: true, medicine: med });
});

// 3. Get Nearby Pharmacies
router.get("/nearby", (req, res) => {
  return res.json({
    success: true,
    pharmacies: PHARMACIES
  });
});

// 4. Place Medicine Order / Forward Prescription to Pharmacy
router.post("/order", (req, res) => {
  const {
    pharmacyId,
    medicines = [],
    deliveryType = "HOME_DELIVERY", // or 'STORE_PICKUP'
    deliveryAddress,
    contactPhone,
    patientName,
    prescriptionId
  } = req.body;

  const pharmacy = PHARMACIES.find(p => p.id === pharmacyId) || PHARMACIES[0];
  const orderId = `PH-ORD-${Date.now().toString().slice(-5)}`;

  const totalAmount = medicines.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const order = {
    orderId,
    pharmacyName: pharmacy.name,
    pharmacyAddress: pharmacy.address,
    pharmacyPhone: pharmacy.phone,
    patientName: patientName || "Rameshwar Patel",
    contactPhone: contactPhone || "9876543210",
    deliveryType,
    deliveryAddress: deliveryAddress || "Rampur Village, Near Panchayat",
    prescriptionId: prescriptionId || "Attached (Verified)",
    medicines,
    totalAmount: Math.round(totalAmount),
    status: "CONFIRMED_PREPARING",
    estimatedDelivery: deliveryType === "HOME_DELIVERY" ? "Today within 2 Hours" : "Ready for pickup in 30 mins",
    createdAt: new Date().toISOString()
  };

  pharmacyOrdersStore.unshift(order);

  return res.json({
    success: true,
    message: "Medicine order placed with local pharmacy",
    order
  });
});

// 5. Get Customer Orders
router.get("/orders", (req, res) => {
  return res.json({
    success: true,
    orders: pharmacyOrdersStore
  });
});

export default router;
