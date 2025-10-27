import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cardRoutes from "./routes/cardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import operatorRoutes from "./routes/operatorRoutes.js";
import controllerRoutes from "./routes/controllerRoutes.js";
import manualPaymentRoutes from "./routes/manualPaymentRoutes.js";
import esp32Routes from "./routes/esp32Routes.js";
import tripRoutes from "./routes/tripRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import esp32Service from "./services/esp32SerialService.js";

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

// ESP32/RFID routes (IoT device endpoints)
app.use("/api/rfid", esp32Routes);

// Trip and ticket routes (guest booking - no auth required)
app.use("/api", tripRoutes);

// Card routes
app.use("/api/cards", cardRoutes);

// Auth routes
app.use("/auth", authRoutes);

// Admin routes (users, reports)
app.use('/api', adminRoutes);

// Operator routes (dashboard, user management, payment verification)
app.use('/api/operator', operatorRoutes);

// Controller routes (ticket validation, logs)
app.use('/api/controller', controllerRoutes);

// Manual payment routes
app.use('/api/manual-payments', manualPaymentRoutes);

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
	app.listen(PORT, async () => {
		console.log(`🚍 Server running on port ${PORT}`);
		
		// Auto-connect to ESP32 if USB port is configured
		const usbPort = process.env.ESP32_USB_PORT;
		if (usbPort) {
			console.log(`\n🔌 Auto-connecting to ESP32 on ${usbPort}...`);
			try {
				await esp32Service.connect(usbPort, 115200);
				console.log('✅ ESP32 USB ready for card registration and payments!\n');
			} catch (error) {
				console.warn('⚠️  ESP32 not connected. Card scanning will not be available.');
				console.warn('   To enable: Connect ESP32 and restart server.\n');
			}
		} else {
			console.log('\n💡 Tip: Set ESP32_USB_PORT in .env to auto-connect ESP32\n');
		}
	});
}

export default app;
