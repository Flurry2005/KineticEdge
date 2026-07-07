import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

interface JWTPayload {
  userId: ObjectId;
  username: string;
  email: string;
  withings: [withingsConnected: Boolean];
}

const JWTModel = {
  createJwtToken(
    userId: ObjectId,
    username: string,
    email: string,
    withingsConnected: boolean,
  ): string {
    const payload: JWTPayload = {
      userId,
      username,
      email,
      withings: [withingsConnected],
    };

    const options: any = {
      expiresIn: "1h",
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string, options);
  },

  decode(token: string) {
    return jwt.decode(token);
  },

  verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  },
};

export default JWTModel;
