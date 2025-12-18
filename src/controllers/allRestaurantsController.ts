import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.js";

export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city as string;
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOptions = (req.query.sortOptions as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    // I am defining the query object, i want the database to query by
    let query: any = {};

    // The query object has city key and we defining a regular expressing that says the city case should be ignored.(upper or lower).
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Restaurant.countDocuments(query);

    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));
      // This is to make sure we are quering by all the cuisines in the array
      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const restaurants = await Restaurant.find(query)
      .sort({ [sortOptions]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("Error searching restaurants", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
