import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import Users from "../models/userModel.js";
import Exercice from "../models/exerciceModel.js";

class ExerciceController {
  async getExercices(req: Request<{}, {}, any>, res: Response) {
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    if (await Users.findOne({ _id: userId })) {
      const exercices = await Exercice.find({});
      return res.status(200).json({ success: true, data: exercices });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }
}

export default new ExerciceController();
