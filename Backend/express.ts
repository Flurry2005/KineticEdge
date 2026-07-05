import express from "express";
import cors from "cors";
import morgan from "morgan";
import { mainRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";

export const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
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

app.use(mainRouter);
