import type { Exercice } from "./Exercice.ts";

export type Session = {
  _id: string;
  userId: string;
  date: string;
  workoutId: string;
  completed: boolean;
  exercices: Exercice[];
};
