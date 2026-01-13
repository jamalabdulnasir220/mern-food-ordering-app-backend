import mongoose, { type InferSchemaType } from "mongoose";

const reviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


reviewSchema.index({ restaurant: 1, createdAt: -1 }); 
reviewSchema.index({ user: 1, createdAt: -1 }); 
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true }); 

export type Review = InferSchemaType<typeof reviewSchema>;

const Review = mongoose.model("Review", reviewSchema);

export default Review;
