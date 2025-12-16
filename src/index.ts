import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import authRouter from "./routes/authRouter.js";
import { v2 as cloudinary } from "cloudinary";
import restaurantRouter from "./routes/restaurantRouter.js";

mongoose
  .connect(`${process.env.MONGODB_CONNECTION_STRING}/foodOrderingApp` as string)
  .then(() => {
    console.log("Connected to the database");
  });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  // secure_distribution: 'mydomain.com',
  // upload_prefix: 'https://api-eu.cloudinary.com'
});

const app = express();

// PORT Number
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "Health OK!!" });
});

app.use("/api", authRouter);
app.use("/api", restaurantRouter)

// connectDB()
//   .then(() => {
//     console.log("Database connection successful");
//     app.listen(PORT, () => {
//       console.log(`Server listening on http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log("Error connecting to the database", error);
//   });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
