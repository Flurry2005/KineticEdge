import express from "express";
import exerciceController from "../controllers/exerciceController.js";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";

export const router = express.Router();

router.get(
  "/get-exercices",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res, next) => {
    try {
      await exerciceController.getExercices(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
);
