import express from "express";
import cors from "cors";
import morgan from "morgan";
import { mainRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import session from "express-session";

export const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://192.168.1.201:5173",
  "http://192.168.1.201:8000",
  "http://192.168.1.201:5173",
  "https://api.kineticedge.liamjorgensen.dev",
  "https://kineticedge.liamjorgensen.dev",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use(mainRouter);
