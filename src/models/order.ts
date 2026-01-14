import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    phoneNumber: { type: String },
  },
  cartItems: [
    {
      menuItemId: { type: String, required: true },
      quantity: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Add indexes for frequently queried fields
orderSchema.index({ user: 1, createdAt: -1 }); // For user order queries
orderSchema.index({ restaurant: 1, createdAt: -1 }); // For restaurant order queries
orderSchema.index({ status: 1 }); // For filtering by status

const Order = mongoose.model("Order", orderSchema);

export default Order;
