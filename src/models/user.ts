import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true, // Add unique constraint for faster lookups
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  favorites: {
    type: [String],
    default: [],
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
  },
  role: {
    type: String,
    enum: ["customer", "restaurant_manager", "admin"],
    default: "customer",
    required: true,
  },
  applicationStatus: {
    type: String, // 'pending', 'approved', 'rejected'
    default: function () {
      // @ts-ignore
      return this.role === "restaurant_manager" ? "pending" : "approved";
    },
  },
});

// Add indexes for frequently queried fields
userSchema.index({ auth0Id: 1 }); // Already unique, but explicit index helps
userSchema.index({ role: 1 }); // For admin queries filtering by role

const User = mongoose.model("User", userSchema);

export default User;
