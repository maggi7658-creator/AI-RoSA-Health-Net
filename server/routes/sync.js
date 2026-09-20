import express from "express";

const router = express.Router();

let syncLogs = [];

// Batch Synchronize Offline Actions
router.post("/batch", (req, res) => {
  const { queue = [], deviceId = "pwa-client-default", clientTimestamp } = req.body;

  if (!Array.isArray(queue)) {
    return res.status(400).json({ error: "Queue must be an array of offline actions" });
  }

  const processedItems = [];
  const errors = [];

  queue.forEach((item, index) => {
    try {
      const { type, payload, queuedAt } = item;
      const logEntry = {
        syncId: `SYNC-${Date.now()}-${index}`,
        type,
        status: "SYNCHRONIZED",
        queuedAt,
        syncedAt: new Date().toISOString(),
        payloadSummary: typeof payload === "object" ? Object.keys(payload).join(", ") : "text"
      };

      processedItems.push(logEntry);
      syncLogs.unshift(logEntry);
      console.log(`[AI-RoSA Sync] Successfully synced offline action: ${type}`);
    } catch (err) {
      errors.push({ itemIndex: index, error: err.message });
    }
  });

  return res.json({
    success: true,
    message: `Batch sync complete. ${processedItems.length} items synchronized.`,
    totalProcessed: processedItems.length,
    errorsCount: errors.length,
    processedItems,
    errors,
    serverTime: new Date().toISOString()
  });
});

// Get Sync History
router.get("/history", (req, res) => {
  return res.json({
    success: true,
    logs: syncLogs.slice(0, 50)
  });
});

export default router;
