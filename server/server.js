import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import triageRoutes from "./routes/triage.js";
import doctorsRoutes from "./routes/doctors.js";
import pharmacyRoutes from "./routes/pharmacy.js";
import diagnosticsRoutes from "./routes/diagnostics.js";
import sosRoutes from "./routes/sos.js";
import syncRoutes from "./routes/sync.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[AI-RoSA API] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/diagnostics", diagnosticsRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/sync", syncRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AI-RoSA Health-Net Core Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    features: [
      "Offline Sync Engine",
      "Multilingual Voice/Text/Image Triage",
      "Doctor Consultations & Digital Prescriptions",
      "Pharmacy Generic Price Comparison",
      "Diagnostic Doorstep Sample Booking",
      "Emergency SOS Dispatch"
    ]
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  AI-RoSA Health-Net Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
