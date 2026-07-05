import express from "express";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import sessionController from "../controllers/sessionController.js";

export const router = express.Router();

router.get(
  "/get-sessions",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res, next) => {
    try {
      await sessionController.getSessions(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
);

router.post(
  "/add-session",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res, next) => {
    try {
      await sessionController.addSession(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
);
router.patch(
  "/update-session",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res, next) => {
    try {
      await sessionController.updateSession(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
);
