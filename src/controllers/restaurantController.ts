import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order.js";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.uploader.upload(dataURI);
  return uploadResponse.url;
};

const processFiles = async (req: Request) => {
  const files = req.files as Express.Multer.File[];
  let restaurantImageUrl = "";
  const menuItemImageUrls: Record<number, string> = {};

  if (files) {
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      if (file.fieldname === "imageFile") {
        restaurantImageUrl = url;
      } else {
        const match = file.fieldname.match(/menuItems\[(\d+)\]\[imageFile\]/);
        if (match && match[1]) {
          const index = parseInt(match[1]);
          menuItemImageUrls[index] = url;
        }
      }
    }
  }

  return { restaurantImageUrl, menuItemImageUrls };
};

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    const existingRestaurant = await Restaurant.findOne({ user: userId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }

    const { restaurantImageUrl, menuItemImageUrls } = await processFiles(req);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = restaurantImageUrl;
    restaurant.user = new mongoose.Types.ObjectId(userId);
    restaurant.lastUpdated = new Date();
    restaurant.approvalStatus = "pending"; // New restaurants need admin approval

    if (req.body.menuItems) {
      req.body.menuItems.forEach((item: any, index: number) => {
        if (menuItemImageUrls[index]) {
          item.imageUrl = menuItemImageUrls[index];
        }
      });
      restaurant.menuItems = req.body.menuItems;
    }

    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const restaurant = await Restaurant.findOne({ user: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found!!" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("Error getting restaurant", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    const restaurant = await Restaurant.findOne({ user: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found!" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;

    // Assign menuItems from body first (contains text fields and existing imageUrls if sent)
    // Note: If menuItems is empty array in body, it clears them.
    if (req.body.menuItems) {
      restaurant.menuItems = req.body.menuItems;
    }

    const { restaurantImageUrl, menuItemImageUrls } = await processFiles(req);

    if (restaurantImageUrl) {
      restaurant.imageUrl = restaurantImageUrl;
    }

    // Update menu items with new uploaded images
    if (restaurant.menuItems) {
      restaurant.menuItems.forEach((item: any, index: number) => {
        if (menuItemImageUrls[index]) {
          item.imageUrl = menuItemImageUrls[index];
        }
      });
    }

    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(200).send(restaurant);
  } catch (error) {
    console.log("Error updating the restaurant", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId })
      .select("_id")
      .lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant", "restaurantName imageUrl") // Only select needed fields
      .populate("user", "name email") // Only select needed fields
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean();
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
