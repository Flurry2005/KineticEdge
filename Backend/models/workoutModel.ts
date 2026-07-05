import mongoose from "mongoose";
import { exerciceSchema } from "./exerciceModel.js";

const workoutsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  workoutName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  workoutDesc: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  tags: {
    type: [String],
    required: false,
  },
  exercices: {
    type: [exerciceSchema],
    required: true,
    minlength: 1,
    maxlength: 20,
  },
});

export default mongoose.model("Workouts", workoutsSchema);
