import mongoose from "mongoose";

export const foodDBCache = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
    },
    data: {
      required: true,
      type: Object,
    },
  },
  { timestamps: true },
);

export default mongoose.model("FoodDBCache", foodDBCache);
