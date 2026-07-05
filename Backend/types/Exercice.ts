import type { ObjectId } from "mongodb";
import type { Set } from "./Set.ts";

export type Exercice = {
  _id: ObjectId;
  name: string;
  type: string;
  muscles: string[];
  sets?: Set[];
};
