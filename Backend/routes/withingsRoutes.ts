import express from "express";
import userModel from "../models/userModel.js";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";
import { refreshTokenWithingsMiddleware } from "../middleware/refreshTokenWithingsMiddleware.js";

export const router = express.Router();
router.get(
  "/api/auth/withings/login",
  jwtMiddleware.jwtTokenIsValid,
  (req, res) => {
    const state = crypto.randomUUID();
    req.session.withingsState = state;

    const clientId = process.env.WITHINGS_CLIENT_ID;
    let redirectUri = process.env.WITHINGS_REDIRECT_URI;
    if (req.host.toString() === "localhost:3000") {
      redirectUri = redirectUri!.replace(
        "https://api.kineticedge.liamjorgensen.dev",
        "http://192.168.1.201:3000",
      );
    }

    if (!clientId || !redirectUri) {
      throw new Error("Missing Withings env vars");
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user.info,user.metrics,user.activity",
      state,
    });
    const url = `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;

    res.redirect(url);
  },
);

router.patch(
  "/api/auth/withings/disconnect",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res) => {
    const userId = res.locals.jwt.userId;

    await userModel.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          withings: {
            connected: false,
          },
        },
      },
    );

    return res.status(200).send();
  },
);

router.get(
  "/api/auth/withings/callback",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    console.log("State", state);

    try {
      const clientId = process.env.WITHINGS_CLIENT_ID;
      let redirectUri = process.env.WITHINGS_REDIRECT_URI;
      if (req.host.toString() === "localhost:3000") {
        redirectUri = redirectUri!.replace(
          "https://api.kineticedge.liamjorgensen.dev",
          "http://192.168.1.201:3000",
        );
      }
      const clientSecret = process.env.WITHINGS_CLIENT_SECRET;

      if (!clientId || !redirectUri || !clientSecret) {
        throw new Error("Missing Withings env vars");
      }

      // -----------------------------
      // 1. Validate query params
      // -----------------------------
      if (typeof code !== "string") {
        return res.status(400).send("Invalid or missing code");
      }

      if (typeof state !== "string") {
        return res.status(400).send("Invalid or missing state");
      }
      console.log(req.session.withingsState);
      if (state !== req.session.withingsState) {
        return res.status(400).send("Invalid state");
      }
      req.session.withingsState = null;

      // -----------------------------
      // 3. Exchange code for tokens
      // -----------------------------
      const body = new URLSearchParams({
        action: "requesttoken",
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      });

      const response = await fetch("https://wbsapi.withings.net/v2/oauth2", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await response.json();

      // -----------------------------
      // 4. Handle API errors properly
      // -----------------------------
      if (!response.ok || data.status !== 0) {
        console.error("Withings error:", data);
        return res.status(400).json(data);
      }

      const tokens = data.body;

      console.log("WITHINGS TOKENS:", {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        userid: tokens.userid,
        expires_in: tokens.expires_in,
      });

      await userModel.findByIdAndUpdate(res.locals.jwt.userId, {
        withings: {
          connected: true,
          withingsUserId: tokens.userid,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
        },
      });

      // -----------------------------
      // 6. Redirect back to frontend
      // -----------------------------
      console.log(process.env.FRONTEND_URL);
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://192.168.1.201:5173"}/settings?withings=connected`,
      );
    } catch (err) {
      console.error("OAuth callback error:", err);
      return res.status(500).send("OAuth failed");
    }
  },
);

router.get(
  "/api/withings/measurements",
  jwtMiddleware.jwtTokenIsValid,
  refreshTokenWithingsMiddleware.checkToken,
  async (req, res) => {
    const user = await userModel.findById({ _id: res.locals.jwt.userId });

    const accessToken = user?.withings?.accessToken;

    const body = new URLSearchParams({
      action: "getmeas",
      access_token: accessToken!,
    });

    const response = await fetch("https://wbsapi.withings.net/measure", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const data = await response.json();
    return res.status(200).json(data);
  },
);

router.get(
  "/api/withings/activity",
  jwtMiddleware.jwtTokenIsValid,
  refreshTokenWithingsMiddleware.checkToken,
  async (req, res) => {
    try {
      const user = await userModel.findById({ _id: res.locals.jwt.userId });

      const accessToken = user?.withings?.accessToken;

      const today = new Date().toISOString().split("T")[0];

      const body = new URLSearchParams({
        action: "getactivity",
        startdateymd: today,
        enddateymd: today,
        data_fields: "steps,calories,totalcalories,distance",
      });

      const response = await fetch("https://wbsapi.withings.net/v2/measure", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const data = await response.json();

      if (data.status !== 0) {
        return res.status(400).json(data);
      }

      const activity = data.body.activities?.[0] ?? {};

      res.json({
        date: today,
        steps: activity.steps ?? 0,
        activeCalories: activity.calories ?? 0,
        totalCalories: activity.totalcalories ?? 0,
        distance: activity.distance ?? 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to fetch activity",
      });
    }
  },
);
