import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter.js";
import { v2 as cloudinary } from "cloudinary";
import restaurantRouter from "./routes/restaurantRouter.js";
import allRestaurantsRouter from "./routes/allRestaurantsRouter.js";
import orderRouter from "./routes/orderRouter.js";

const app = express();

// PORT Number
const PORT = 3000;

// Middlewares
// CORS configuration - allow frontend URL from environment variable or default to allow all in development
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : undefined; // undefined means allow all (for development)

app.use(cors());
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!!" });
});

app.use("/api", authRouter);
app.use("/api", restaurantRouter);
app.use("/api", allRestaurantsRouter);
app.use("/api/order", orderRouter);

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}/foodOrderingApp` as string
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
