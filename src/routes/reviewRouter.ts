import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getRestaurantReviews,
  getUserReview,
} from "../controllers/reviewController.js";
import { jwtCheck, parseJwt } from "../middleware/auth.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation.js";

const reviewRouter = express.Router();

const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Comment must be less than 500 characters"),
  handleValidationErrors,
];

// Get reviews for a restaurant (public)
reviewRouter.get("/restaurant/:restaurantId/reviews", getRestaurantReviews);

// Get user's review for a restaurant (authenticated)
reviewRouter.get(
  "/restaurant/:restaurantId/my-review",
  jwtCheck,
  parseJwt,
  getUserReview
);

// Create review (authenticated)
reviewRouter.post(
  "/restaurant/:restaurantId/reviews",
  jwtCheck,
  parseJwt,
  validateReview,
  createReview
);

// Update review (authenticated)
reviewRouter.put(
  "/reviews/:reviewId",
  jwtCheck,
  parseJwt,
  validateReview,
  updateReview
);

// Delete review (authenticated)
reviewRouter.delete("/reviews/:reviewId", jwtCheck, parseJwt, deleteReview);

export default reviewRouter;
