import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: Number,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productBrand: {
      type: String,
      default: "",
    },

    productImage: {
      type: String,
      default: "",
    },

    // User input
    quantityGrams: {
      type: Number,
      required: true,
      min: 0,
    },

    // Nutrition per 100g
    caloriesPer100g: {
      type: Number,
      required: true,
      default: 0,
    },

    carbohydratesPer100g: {
      type: Number,
      required: true,
      default: 0,
    },

    fatsPer100g: {
      type: Number,
      required: true,
      default: 0,
    },

    proteinPer100g: {
      type: Number,
      required: true,
      default: 0,
    },

    // Nutrition for quantityGrams
    calories: {
      type: Number,
      required: true,
      default: 0,
    },

    carbohydratesGrams: {
      type: Number,
      required: true,
      default: 0,
    },

    fatsGrams: {
      type: Number,
      required: true,
      default: 0,
    },

    proteinGrams: {
      type: Number,
      required: true,
      default: 0,
    },

    consumedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
);

const daySchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },

    products: {
      type: [productSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const foodIntakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    days: {
      type: [daySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("FoodIntake", foodIntakeSchema);
