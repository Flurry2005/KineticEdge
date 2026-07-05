import { router as userRouter } from "./userRoutes.js";
import { router as exerciceRouter } from "./exerciceRoutes.js";
import { router as workoutRouter } from "./workoutRoutes.js";
import { router as sessionRouter } from "./sessionRoutes.js";
import { router as withingsRouter } from "./withingsRoutes.js";
import express from "express";

export const mainRouter = express.Router();

mainRouter.use(userRouter);

mainRouter.use(exerciceRouter);

mainRouter.use(workoutRouter);

mainRouter.use(sessionRouter);

mainRouter.use(withingsRouter);
