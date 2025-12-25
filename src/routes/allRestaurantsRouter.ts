import express from "express";
import { param } from "express-validator";
import {
  getRestaurant,
  getRestaurantsByIds,
  searchRestaurants,
} from "../controllers/allRestaurantsController.js";

const allRestaurantsRouter = express.Router();

allRestaurantsRouter.get("/restaurants/by-ids", getRestaurantsByIds);

allRestaurantsRouter.get(
  "/restaurants/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Restaurant ID parameter must be a valid string"),
  getRestaurant
);

allRestaurantsRouter.get(
  "/restaurants/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  searchRestaurants
);

export default allRestaurantsRouter;
