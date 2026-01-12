import mongoose, { type InferSchemaType } from "mongoose";

const menuItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
});

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

const restaurantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurantName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  cuisines: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
  approvalStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "approved" // Default to approved for backward compatibility
  },
});

// Add indexes for frequently queried fields
restaurantSchema.index({ city: 1, approvalStatus: 1 }); // For search queries
restaurantSchema.index({ user: 1 }); // For finding restaurant by user
restaurantSchema.index({ approvalStatus: 1 }); // For admin queries
restaurantSchema.index({ lastUpdated: -1 }); // For sorting
restaurantSchema.index({ restaurantName: "text", cuisines: "text" }); // Text search index

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
