import type { Request, Response } from "express";
import User from "../models/user.js";

export const getRestaurantManagers = async (req: Request, res: Response) => {
  try {
    const managers = await User.find({ role: "restaurant_manager" }).sort({ _id: -1 });
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
