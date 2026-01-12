import type { Request, Response } from "express";
import User from "../models/user.js";
import Restaurant from "../models/restaurant.js";

export const getRestaurantManagers = async (req: Request, res: Response) => {
  try {
    const managers = await User.find({ role: "restaurant_manager" })
      .select("-favorites") // Exclude unnecessary fields
      .sort({ _id: -1 })
      .lean();
    res.json(managers);
  } catch (error) {
    console.log("Error getting restaurant managers", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.applicationStatus = status;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log("Error updating application status", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("user", "name email")
      .select("-menuItems") // Exclude menuItems to reduce payload size
      .sort({ _id: -1 })
      .lean();
    res.json(restaurants);
  } catch (error) {
    console.log("Error getting all restaurants", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRestaurantApprovalStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.approvalStatus = status;
    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (error) {
    console.log("Error updating restaurant approval status", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
