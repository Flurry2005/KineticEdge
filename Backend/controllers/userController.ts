import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import JWTModel from "../models/JWT.js";
import { ObjectId } from "mongodb";
import type { Session } from "../types/Session.ts";
import type { User } from "../types/User.ts";
import Sessions from "../models/sessionModel.js";
import Users from "../models/userModel.js";

class UserController {
  async login(req: Request<{}, {}, LoginBody>, res: Response) {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, data: "Invalid credentials!" });

    if (await bcrypt.compare(password, user.passwordHash)) {
      const userObj = user.toObject();
      //@ts-ignore
      delete userObj.passwordHash;
      delete userObj.withings?.accessToken;
      delete userObj.withings?.refreshToken;
      delete userObj.withings?.expiresAt;
      delete userObj.withings?.withingsUserId;

      const token = JWTModel.createJwtToken(
        user._id,
        user.username,
        email,
        user.withings ? user.withings.connected : false,
      );
      const expiry = new Date(Date.now() + 1000 * 60 * 60);
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: expiry,
      });
      console.log(userObj);
      return res.status(200).json({ success: true, data: userObj });
    } else {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials!" });
    }
  }
  async register(req: Request<{}, {}, RegisterBody>, res: Response) {
    const { fullname, username, email, password } = req.body;
    if (await Users.findOne({ username: username })) {
      return res
        .status(409)
        .json({ success: false, error: "Username already exists!" });
    }
    if (await Users.findOne({ email: email })) {
      return res
        .status(409)
        .json({ success: false, error: "Email already exists!" });
    }
    await Users.insertOne({
      fullname,
      username,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });

    return res
      .status(200)
      .json({ success: true, data: "Account successfully registered!" });
  }
  async updateUser(req: Request<{}, {}, User>, res: Response) {
    const user = req.body as User;

    //Ensure no malicious Request
    if (
      res.locals.jwt.username !== user.username ||
      res.locals.jwt.email !== user.email ||
      res.locals.jwt.userId !== user._id
    ) {
      return res.status(403).json({
        success: false,
        error: "You're not authorized to perform this action!",
      });
    }

    if (!(await Users.findById(new ObjectId(res.locals.jwt.userId)))) {
      return res.status(404).json({ success: false, error: "User not found!" });
    }
    await Users.updateOne(
      { _id: new ObjectId(res.locals.jwt.userId) },
      { $set: { bio: user.bio, profilePicture: user.profilePicture } },
    );

    return res
      .status(200)
      .json({ success: true, data: "Account successfully updated!" });
  }
  async getProfile(req: Request<{ username: string }, {}, any>, res: Response) {
    const username = req.params.username;
    const user = await Users.findOne({ username: username });

    if (!user)
      return res.status(404).json({ success: false, error: "user not found" });
    const sessions: Session[] = await Sessions.find({ userId: user.id });
    const volume = sessions
      .filter(
        (session: Session) =>
          session.completed &&
          new Date(session.date).getMonth() === new Date().getMonth() &&
          new Date(session.date).getFullYear() === new Date().getFullYear(),
      )
      .reduce((sessionAcc, session) => {
        return (
          sessionAcc +
          session.exercices.reduce((exerciseAcc, exercise) => {
            return (
              exerciseAcc +
              (exercise.sets ?? []).reduce((setAcc, set) => {
                return setAcc + (set.weight || 0) * (set.reps || 0);
              }, 0)
            );
          }, 0)
        );
      }, 0);

    const completedDays = new Set(
      sessions
        .filter((s) => s.completed)
        .map((s) => new Date(s.date).toDateString()),
    );
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayKey = today.toDateString();
    const yesterdayKey = yesterday.toDateString();
    let longest = 1;
    let current = 1;
    let streak = 0;

    if (!completedDays.has(todayKey) && !completedDays.has(yesterdayKey)) {
      streak = 0;
    } else {
      const cursor = new Date(completedDays.has(todayKey) ? today : yesterday);

      while (completedDays.has(cursor.toDateString())) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    const days = Array.from(completedDays)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    if (days.length === 0) longest = 0;

    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1];
      const curr = days[i];

      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        current++;
      } else {
        longest = Math.max(longest, current);
        current = 1;
      }
    }

    longest = Math.max(longest, current);

    return res.status(200).json({
      success: true,
      data: {
        fullname: user.fullname,
        username: user.username,
        bio: user.bio,
        volume: volume,
        workouts: sessions.filter((workout) => workout.completed === true)
          .length,
        streak: streak,
        beststreak: longest,
        profilePicture: user.profilePicture,
        membersince: user.createdAt,
      },
    });
  }
}

type LoginBody = {
  email: string;
  password: string;
};
type RegisterBody = {
  fullname: string;
  username: string;
  email: string;
  password: string;
};

export default new UserController();
