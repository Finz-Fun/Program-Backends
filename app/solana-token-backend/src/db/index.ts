import mongoose from "mongoose";

export const connectDB =  () => {
  mongoose.connect(process.env.MONGODB_URI!).then(() => {
    console.log("Connected to MongoDB");
  }).catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
};
