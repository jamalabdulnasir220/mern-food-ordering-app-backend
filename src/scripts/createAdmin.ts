import mongoose from "mongoose";
import User from "../models/user.js";
import "dotenv/config";

const promoteToAdmin = async () => {
  const email = process.argv[2];
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    console.error("ADMIN_SECRET environment variable is not set.");
    process.exit(1);
  }

  const providedSecret = process.argv[3];

  if (providedSecret !== adminSecret) {
    console.error("Invalid admin secret provided.");
    console.log("Usage: npx ts-node src/scripts/createAdmin.ts <email> <secret>");
    process.exit(1);
  }

  if (!email) {
    console.error("Please provide an email address as an argument.");
    console.log("Usage: npx ts-node src/scripts/createAdmin.ts <email> <secret>");
    process.exit(1);
  }

  try {
    await mongoose.connect(
      `${process.env.MONGODB_CONNECTION_STRING}/foodOrderingApp` as string
    );
    console.log("Connected to database");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "admin";
    user.applicationStatus = "approved";
    await user.save();

    console.log(`Successfully promoted ${user.name} (${email}) to Admin.`);
  } catch (error) {
    console.error("Error promoting user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

promoteToAdmin();
