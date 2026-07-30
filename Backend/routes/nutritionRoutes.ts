import express from "express";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import foodInTakeModel from "../models/foodInTakeModel.js";
import FoodDBCache from "../models/FoodDBCache.js";
import {
  barcodeLimiter,
  addFoodLimiter,
  readLimiter,
  attachUserId,
} from "../middleware/rateLimiter.js";
import customEan from "../models/customEan.js";

export const router = express.Router();

router.get(
  "/barcode",
  jwtMiddleware.jwtTokenIsValid,
  attachUserId,
  barcodeLimiter,
  async (req, res) => {
    const barcode = req.query.barcode as string;

    const foodData = await FoodDBCache.findOne({ barcode: barcode });

    if (foodData) return res.status(200).json(foodData.data);
    else {
      console.log("Barcode not found in cache, fetching...");
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v3/product/${barcode}?fields=product_name,nutriments,brands,image_front_url`,
      );

      const data = await response.json();
      if (data.status === "success") {
        await FoodDBCache.insertOne({ barcode, data });
        return res.status(200).json(data);
      } else {
        const userDefinedProduct = await customEan.findOne({
          userId: res.locals.jwt.userId,
          barcode: barcode,
        });
        const product = userDefinedProduct
          ? userDefinedProduct.toObject().data
          : null;

        if (product) {
          const response = { ...product };

          return res.status(200).json(response);
        }

        return res.status(404).json(data);
      }
    }
  },
);

router.post(
  "/add-food-product",
  jwtMiddleware.jwtTokenIsValid,
  attachUserId,
  addFoodLimiter,
  async (req, res) => {
    try {
      const userId = res.locals.jwt.userId;

      const {
        date,
        barcode,
        productName,
        productBrand,
        productImage,

        quantityGrams,

        caloriesPer100g,
        carbohydratesPer100g,
        fatsPer100g,
        proteinPer100g,

        calories,
        carbohydratesGrams,
        fatsGrams,
        proteinGrams,
      } = req.body;

      if (!barcode || !productName || !quantityGrams) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      // Validate the provided date (if any)
      if (date && isNaN(new Date(date).getTime())) {
        return res.status(400).json({
          message: "Invalid date",
        });
      }

      // Use the provided date or fall back to today
      const entryDate = date
        ? new Date(date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      let foodIntake = await foodInTakeModel.findOne({ userId });

      // Create user's food document if it doesn't exist
      if (!foodIntake) {
        foodIntake = await foodInTakeModel.create({
          userId,
          days: [
            {
              date: entryDate,
              products: [],
            },
          ],
        });
      }

      // Find the entry for the requested date
      let dayEntry = foodIntake.days.find((day) => day.date === entryDate);

      // Create the day if it doesn't exist
      if (!dayEntry) {
        foodIntake.days.push({
          date: entryDate,
          products: [],
        });

        dayEntry = foodIntake.days[foodIntake.days.length - 1];
      }

      // Add the product
      dayEntry.products.push({
        barcode,
        productName,
        productBrand,
        productImage,

        quantityGrams,

        caloriesPer100g,
        carbohydratesPer100g,
        fatsPer100g,
        proteinPer100g,

        calories,
        carbohydratesGrams,
        fatsGrams,
        proteinGrams,
      });

      //See if barcode exists in cache => if doesnt, barcode dont exist add as customEan for user
      if (
        !(await FoodDBCache.findOne({ barcode: barcode })) &&
        !(await customEan.findOne({
          userId: res.locals.jwt.userId,
          barcode: barcode,
        }))
      ) {
        await customEan.insertOne({
          userId: res.locals.jwt.userId,
          barcode: barcode,
          data: {
            status: "success",
            product: {
              product_name: productName,
              brands: productBrand,
              image_front_url: productImage,
              nutriments: {
                "energy-kcal_100g": caloriesPer100g,
                carbohydrates_100g: carbohydratesPer100g,
                fat_100g: fatsPer100g,
                proteins_100g: proteinPer100g,
              },
            },
          },
        });
      }

      await foodIntake.save();

      return res.status(201).json({
        message: "Product added",
        foodIntake,
      });
    } catch (error) {
      console.error("Add food product error:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  },
);
router.delete(
  "/remove-food-product",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res) => {
    try {
      const userId = res.locals.jwt.userId;

      const { _id, date } = req.body;

      if (!_id || !date) {
        return res.status(400).json({
          message: "Missing product id or date",
        });
      }

      // Validate YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message: "Invalid date format. Expected YYYY-MM-DD",
        });
      }

      const foodIntake = await foodInTakeModel.findOne({
        userId,
      });

      if (!foodIntake) {
        return res.status(404).json({
          message: "Food intake not found",
        });
      }

      // Find the requested day
      const dayEntry = foodIntake.days.find((day) => day.date === date);

      if (!dayEntry) {
        return res.status(404).json({
          message: "Food entry not found for this date",
        });
      }

      // Find the product
      const productIndex = dayEntry.products.findIndex(
        (product) => product._id.toString() === _id,
      );

      if (productIndex === -1) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Remove the product
      dayEntry.products.splice(productIndex, 1);

      // Remove the day if there are no products left
      if (dayEntry.products.length === 0) {
        foodIntake.days.pull(dayEntry._id);
      }

      await foodIntake.save();

      return res.status(200).json({
        message: "Product removed",
        foodIntake,
      });
    } catch (error) {
      console.error("Remove food product error:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  },
);

router.get(
  "/get-all-foodIntake",

  jwtMiddleware.jwtTokenIsValid,
  attachUserId,
  readLimiter,
  async (req, res) => {
    try {
      const userId = res.locals.jwt.userId;

      const foodIntake = await foodInTakeModel.findOne({
        userId,
      });

      if (!foodIntake) {
        return res.status(200).json({
          userId,
          days: [],
        });
      }

      res.status(200).json(foodIntake);
    } catch (error) {
      console.error("Get food intake error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  },
);

router.get(
  "/get-recent-products",
  jwtMiddleware.jwtTokenIsValid,
  attachUserId,
  readLimiter,
  async (req, res) => {
    try {
      const userId = res.locals.jwt.userId;

      const foodIntake = await foodInTakeModel.findOne({ userId });

      if (!foodIntake) {
        return res.status(200).json([]);
      }

      const uniqueBarcodes = new Set<number>();

      const sortedDays = [...foodIntake.days].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      const recentProducts = [];

      for (const day of sortedDays) {
        for (let i = day.products.length - 1; i >= 0; i--) {
          const product = day.products[i];

          if (uniqueBarcodes.has(product.barcode)) continue;

          uniqueBarcodes.add(product.barcode);

          // Try FoodDBCache first
          let cachedProduct = await FoodDBCache.findOne({
            barcode: product.barcode,
          }).lean();

          if (cachedProduct) {
            recentProducts.push({
              barcode: product.barcode,
              ...cachedProduct.data,
            });
          } else {
            // Fall back to user's custom products
            const customProduct = await customEan
              .findOne({
                userId,
                barcode: product.barcode,
              })
              .lean();

            if (customProduct) {
              recentProducts.push({
                barcode: product.barcode,
                ...customProduct.data,
              });
            }
          }

          if (recentProducts.length === 20) {
            break;
          }
        }

        if (recentProducts.length === 20) {
          break;
        }
      }

      return res.status(200).json(recentProducts);
    } catch (error) {
      console.error("Recent products error:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  },
);

export default router;
