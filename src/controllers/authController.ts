import type { Request, Response } from "express";
import User from "../models/user.js";

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id, role } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      // If existing user doesn't have a role, set it to customer (for backward compatibility)
      if (!existingUser.role) {
        existingUser.role = "customer";
        await existingUser.save();
      }
      return res.status(200).json(existingUser.toObject());
    }
    // Ensure role is set, default to "customer" if not provided
    const userData = {
      ...req.body,
      role: role || "customer",
    };
    const newUser = new User(userData);
    await newUser.save();
    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log("Error creating current user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { name, addressLine1, country, city } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.addressLine1 = addressLine1;
    user.country = country;
    user.city = city;

    const updatedUser = await user.save();

    res.status(200).json(updatedUser.toObject());
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    const currentUser = await User.findOne({ _id: userId });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createCurrentUser, updateUser, getUser };
