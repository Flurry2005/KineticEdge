import dotenv from "dotenv";
dotenv.config();

import { app } from "./express.ts";
import DatabaseConnection from "./services/Database.ts";

DatabaseConnection.connect();

const PORT: number = parseInt(process.env.PORT!) || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
  fetch("https://api.kineticedge.liamjorgensen.dev/").catch(() => {});
}, 30_000);
