import type { Request, Response } from "express";
import Review from "../models/review.js";
import Restaurant from "../models/restaurant.js";
import mongoose from "mongoose";

// Helper function to calculate and update restaurant average rating
const updateRestaurantRating = async (restaurantId: string) => {
  const reviews = await Review.find({ restaurant: restaurantId })
    .select("rating")
    .lean();

  if (reviews.length === 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $unset: { averageRating: "" },
      totalReviews: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews: reviews.length,
  });
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;

    if (!restaurantId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID is required" });
    }

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      restaurant: restaurantId,
      user: userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this restaurant" });
    }

    // Create review
    const review = new Review({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      user: new mongoose.Types.ObjectId(userId),
      rating,
      comment: comment || "",
    });

    await review.save();

    // Update restaurant average rating
    await updateRestaurantRating(restaurantId);

    // Populate user info for response
    await review.populate("user", "name email");

    res.status(201).json(review);
  } catch (error: any) {
    console.log("Error creating review", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this restaurant" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating;
    review.comment = comment || "";

    await review.save();

    // Update restaurant average rating
    await updateRestaurantRating(review.restaurant.toString());

    await review.populate("user", "name email");

    res.json(review);
  } catch (error) {
    console.log("Error updating review", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const restaurantId = review.restaurant.toString();

    await Review.findByIdAndDelete(reviewId);

    // Update restaurant average rating
    await updateRestaurantRating(restaurantId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error deleting review", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRestaurantReviews = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ restaurant: restaurantId });

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("Error getting restaurant reviews", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserReview = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { restaurantId } = req.params;

    const review = await Review.findOne({
      restaurant: restaurantId,
      user: userId,
    })
      .populate("user", "name email")
      .lean();

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    console.log("Error getting user review", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
