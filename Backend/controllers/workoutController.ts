import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import type { Exercice } from "../types/Exercice.ts";
import Users from "../models/userModel.ts";
import Workouts from "../models/workoutModel.ts";

class WorkoutController {
  async createWorkout(req: Request<{}, {}, WorkoutBody>, res: Response) {
    const { workoutName, workoutDesc, tags, exercices } = req.body;
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    if (await Users.findOne({ _id: userId })) {
      await Workouts.insertOne({
        userId: res.locals.jwt.userId,
        workoutName: workoutName,
        workoutDesc: workoutDesc,
        tags: tags!,
        exercices: exercices,
      });
      return res.status(201).json({ success: true, data: "Workout Created" });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }
  async getWorkouts(req: Request<{}, {}, any>, res: Response) {
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    if (await Users.findOne({ _id: userId })) {
      const workouts = await Workouts.find({
        userId: res.locals.jwt.userId,
      });
      return res.status(200).json({ success: true, data: workouts });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }
}

type WorkoutBody = {
  workoutName: string;
  workoutDesc: string;
  tags?: [];
  exercices: Exercice[];
};

export default new WorkoutController();
