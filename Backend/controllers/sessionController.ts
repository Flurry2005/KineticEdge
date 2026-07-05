import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import type { Session } from "../types/Session.ts";
import Sessions from "../models/sessionModel.ts";
import Users from "../models/userModel.ts";
import Workouts from "../models/workoutModel.ts";

class SessionController {
  async getSessions(req: Request<{}, {}, any>, res: Response) {
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    if (await Users.findOne({ _id: userId })) {
      const workouts = await Sessions.find({ userId: res.locals.jwt.userId });
      return res.status(200).json({ success: true, data: workouts });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }

  async addSession(req: Request<{}, {}, any>, res: Response) {
    const { workoutId, date } = req.body;
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    if (await Users.findOne({ _id: userId })) {
      const workout = await Workouts.findOne({ _id: new ObjectId(workoutId) });

      if (!workout)
        return res
          .status(404)
          .json({ success: false, error: "Workout not found!" });

      await Sessions.insertOne({
        userId: res.locals.jwt.userId,
        workoutId: workoutId,
        completed: false,
        date: new Date(date),
        exercices: workout.exercices,
      });
      return res.status(201).json({ success: true, data: "Session added" });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }
  async updateSession(req: Request<{}, {}, UpdateSessionBody>, res: Response) {
    const { session } = req.body;
    const userId = new ObjectId(res.locals.jwt.userId) as ObjectId;
    const user = await Users.findOne({ _id: userId });
    if (user && res.locals.jwt.userId === session.userId) {
      await Sessions.updateOne(
        { _id: new ObjectId(session._id), userId: res.locals.jwt.userId },
        {
          $set: {
            completed: session.completed,
            exercices: session.exercices,
          },
        },
      );
      return res.status(200).json({ success: true, data: "Session updated" });
    }

    return res.status(404).json({ success: false, error: "User not found!" });
  }
}
type UpdateSessionBody = {
  session: Session;
};

export default new SessionController();
