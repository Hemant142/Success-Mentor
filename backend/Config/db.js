import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODBURI);
    console.log(`MongoDB connected: `);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connection;
