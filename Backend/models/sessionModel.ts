import mongoose from "mongoose";
import { exerciceSchema } from "./exerciceModel.js";

const sessionsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  workoutId: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  exercices: {
    type: [exerciceSchema],
  },
});

export default mongoose.model("Sessions", sessionsSchema);
