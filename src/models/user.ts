import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
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
  favorites: {
    type: [String],
    default: [],
  },
  role: {
    type: String,
    enum: ["customer", "restaurant_manager", "admin"],
    default: "customer",
    required: true,
  },
  applicationStatus: {
    type: String, // 'pending', 'approved', 'rejected'
    default: function() {
      // @ts-ignore
      return this.role === 'restaurant_manager' ? 'pending' : 'approved';
    }
  }
});

const User = mongoose.model("User", userSchema);

export default User;
