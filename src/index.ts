import express, { type Request, type Response } from "express";
import cors from "cors";
import compression from "compression";
import "dotenv/config";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter.js";
import { v2 as cloudinary } from "cloudinary";
import restaurantRouter from "./routes/restaurantRouter.js";
import allRestaurantsRouter from "./routes/allRestaurantsRouter.js";
import orderRouter from "./routes/orderRouter.js";
import adminRouter from "./routes/adminRouter.js";
import reviewRouter from "./routes/reviewRouter.js";

const app = express();

// PORT Number - Use environment variable for Render
const PORT = process.env.PORT || 3000;

// Middlewares
// CORS configuration - allow frontend URL from environment variable or default to allow all in development
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : undefined; // undefined means allow all (for development)

// Compression middleware - reduces response size significantly
app.use(compression());

app.use(cors());
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.json({ limit: "10mb" })); // Add limit to prevent large payloads

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!!" });
});

app.use("/api", authRouter);
app.use("/api", restaurantRouter);
app.use("/api", allRestaurantsRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api", reviewRouter);

async function startServer() {
  try {
    // Connect to MongoDB with optimized connection settings
    await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}/foodOrderingApp` as string,
      {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      }
    );
    console.log("Connected to the database");

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
      api_key: process.env.CLOUDINARY_API_KEY as string,
      api_secret: process.env.CLOUDINARY_API_SECRET as string,
      // secure_distribution: 'mydomain.com',
      // upload_prefix: 'https://api-eu.cloudinary.com'
    });
    console.log("Cloudinary configuration successful");

    // Start listening only after both are ready
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
