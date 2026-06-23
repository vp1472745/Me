import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI||"MONGO_URI=mongodb+srv://Vineet:roommilega1611@cluster0.udexxmx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

export default connectDB;