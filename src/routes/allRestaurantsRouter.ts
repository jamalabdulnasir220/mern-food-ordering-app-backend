import express from "express";
import { param } from "express-validator";
import { searchRestaurants } from "../controllers/allRestaurantsController.js";

const allRestaurantsRouter = express.Router();

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
