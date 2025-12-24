import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order.js";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    const existingRestaurant = await Restaurant.findOne({ user: userId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);

    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(userId);
    restaurant.lastUpdated = new Date();
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
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();

    res.status(200).send(restaurant);
  } catch (error) {
    console.log("Error updating the restaurant", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  // We get the image file in our req after it has been stored in memory
  const image = file;
  // We then convert the image buffer into a base64 string.
  const base64Image = Buffer.from(image.buffer).toString("base64");
  // Then we define some data uri, about the image. mimetype is the type of the image. png/jgp etc.
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  // We will then upload the image to cloudinary
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  // After the upload is successful, we should have the image url in the response

  return uploadResponse.url;
};

export const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
