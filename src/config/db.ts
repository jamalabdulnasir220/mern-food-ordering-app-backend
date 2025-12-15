import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}/foodOrderingApp` as string);
};

export default connectDB
