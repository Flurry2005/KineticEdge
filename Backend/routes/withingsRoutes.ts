import express from "express";

export const router = express.Router();
router.get("/api/auth/withings/login", (req, res) => {
  const state = crypto.randomUUID();

  // TODO: store state tied to your user (DB/Redis/session)
  // req.session.state = state;

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
});
