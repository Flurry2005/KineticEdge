import type { ObjectId } from "mongodb";

export type User = {
  _id: ObjectId;
  fullname: string;
  username: string;
  email: string;
  withings: { connected: Boolean };
  createdAt: Date;
  profilePicture?: string;
  bio?: string;
};

export type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};
