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
    default: "approved", // Default to approved for backward compatibility
  },
  averageRating: { type: Number, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
});

restaurantSchema.index({ city: 1, approvalStatus: 1 }); 
restaurantSchema.index({ user: 1 }); 
restaurantSchema.index({ approvalStatus: 1 }); 
restaurantSchema.index({ lastUpdated: -1 }); 
restaurantSchema.index({ restaurantName: "text", cuisines: "text" }); 

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
