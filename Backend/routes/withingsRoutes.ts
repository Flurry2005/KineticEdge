import express from "express";
import userModel from "../models/userModel.js";
import { jwtMiddleware } from "../middleware/jwtMiddleware.js";

export const router = express.Router();
router.get(
  "/api/auth/withings/login",
  jwtMiddleware.jwtTokenIsValid,
  (req, res) => {
    const state = crypto.randomUUID();
    req.session.withingsState = state;

    const clientId = process.env.WITHINGS_CLIENT_ID;
    const redirectUri = process.env.WITHINGS_REDIRECT_URI;

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

router.get(
  "/api/auth/withings/callback",
  jwtMiddleware.jwtTokenIsValid,
  async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    try {
      const clientId = process.env.WITHINGS_CLIENT_ID;
      const redirectUri = process.env.WITHINGS_REDIRECT_URI;
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
      return res.redirect(
        `${process.env.FRONTEND_URL}/settings?withings=connected`,
      );
    } catch (err) {
      console.error("OAuth callback error:", err);
      return res.status(500).send("OAuth failed");
    }
  },
);
