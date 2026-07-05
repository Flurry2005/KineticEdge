import type { Exercice } from "./Exercice.ts";

export type Workout = {
  _id: string;
  userId: string;
  workoutName: string;
  workoutDesc: string;
  tags: string[];
  exercices: Exercice[];
};
