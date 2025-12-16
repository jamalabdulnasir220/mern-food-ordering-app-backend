import express from "express";
import multer from "multer";
import { createRestaurant } from "../controllers/restaurantController.js";
import { jwtCheck, parseJwt } from "../middleware/auth.js";
import { validateMyRestaurantData } from "../middleware/validation.js";

const restaurantRouter = express.Router();

// Multer middleware to handle the image.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
});

// What happens is when the image is uploaded from the frontend, multer does some validations and stores the image in the memory.

restaurantRouter.post(
  "/my/restaurant",
  upload.single("imageFile"),
  validateMyRestaurantData,
  jwtCheck,
  parseJwt,

  createRestaurant
);

export default restaurantRouter;
