import mongoose from "mongoose";

const DataType = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "success",
      required: true,
    },
    product: {
      product_name: {
        type: String,
        required: true,
      },
      brands: {
        type: String,
        required: true,
      },
      image_front_url: {
        type: String,
      },
      nutriments: {
        type: {
          "energy-kcal_100g": {
            type: Number,
            required: true,
          },
          carbohydrates_100g: {
            type: Number,
            required: true,
          },
          fat_100g: {
            type: Number,
            required: true,
          },
          proteins_100g: {
            type: Number,
            required: true,
          },
        },
        required: true,
      },
    },
  },
  { _id: false },
);

const CustomEanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    barcode: {
      type: Number,
      required: true,
    },
    data: {
      type: DataType,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("CustomEan", CustomEanSchema);
