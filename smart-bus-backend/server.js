import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cardRoutes from "./routes/cardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import controllerRoutes from "./routes/controllerRoutes.js";
import manualPaymentRoutes from "./routes/manualPaymentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(morgan('dev'));

// ✅ This is crucial to parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies (for forms)
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get("/", (req, res) => res.send("SmartBus API is running ✅"));

// Card routes
app.use("/api/cards", cardRoutes);

// Auth routes
app.use("/auth", authRoutes);

// Admin routes (users, reports)
app.use('/api', adminRoutes);

// Controller routes (ticket validation, logs)
app.use('/api/controller', controllerRoutes);

// Manual payment routes
app.use('/api/manual-payments', manualPaymentRoutes);

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
	app.listen(PORT, () => console.log(`🚍 Server running on port ${PORT}`));
}

export default app;
