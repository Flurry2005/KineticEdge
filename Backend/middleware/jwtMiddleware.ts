import type { Request, Response, NextFunction } from "express";
import JWTModel from "../models/JWT.js";

const middleware: any = {};
export { middleware as jwtMiddleware };

middleware.jwtTokenIsValid = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    res.locals.jwt = JWTModel.verify(token);
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};
