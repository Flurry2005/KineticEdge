import express from "express";
import userController from "../controllers/userController.js";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";

export const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    await userController.login(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
router.post("/register", async (req, res, next) => {
  try {
    await userController.register(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
router.post(
  "/update-user",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res, next) => {
    try {
      await userController.updateUser(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
);

router.get("/profile/:username", async (req, res, next) => {
  try {
    await userController.getProfile(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
