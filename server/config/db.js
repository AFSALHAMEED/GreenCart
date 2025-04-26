import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );
    await mongoose.connect(`${process.env.MONgODB_URI}/greenCart`);
  } catch (error) {}
};

export default connectDB;
