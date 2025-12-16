import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    const existingRestaurant = await Restaurant.findOne({ user: userId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }

    // We get the image file in our req after it has been stored in memory
    const image = req.file as Express.Multer.File;
    // We then convert the image buffer into a base64 string.
    const base64Image = Buffer.from(image.buffer).toString("base64");
    // Then we define some data uri, about the image. mimetype is the type of the image. png/jgp etc.
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    // We will then upload the image to cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    // After the upload is successful, we should have the image url in the response

    const restaurant = new Restaurant(req.body);

    restaurant.imageUrl = uploadResponse.url;
    restaurant.user = new mongoose.Types.ObjectId(userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
