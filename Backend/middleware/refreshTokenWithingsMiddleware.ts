import type { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel.js";

const middleware: any = {};
export { middleware as refreshTokenWithingsMiddleware };

middleware.checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Date.now() >= res.locals.jwt.withings.expiresAt) {
    const user = await userModel.findById({ _id: res.locals.jwt.userId });

    const clientId = process.env.WITHINGS_CLIENT_ID;
    const clientSecret = process.env.WITHINGS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing Withings env vars");
    }

    if (!user) return;

    const refreshToken = user.withings?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "User has no Withings refresh token",
      });
    }

    const body = new URLSearchParams({
      action: "requesttoken",
      grant_type: "refresh_token",
      client_id: process.env.WITHINGS_CLIENT_ID!,
      client_secret: process.env.WITHINGS_CLIENT_SECRET!,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch("https://wbsapi.withings.net/v2/oauth2", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await response.json();

      await userModel.findByIdAndUpdate(user._id, {
        "withings.accessToken": data.body.access_token,
        "withings.refreshToken": data.body.refresh_token,
        "withings.expiresAt": Date.now() + data.body.expires_in * 1000,
      });

      if (response.ok) {
        next();
      }
    } catch (error) {
      return res.status(500).send();
    }
  } else {
    next();
  }
};
