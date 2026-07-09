# Kinetic Edge

This app solves the problem of inconsistent and unstructured workout tracking by giving users a complete system to plan, log, and analyze their gym training in one place; users can create custom workouts with names, descriptions, and exercises, schedule them as training sessions on specific dates, and accurately track performance by logging sets, reps, and weight for each exercise, while also providing long-term progress insights such as total completed workouts, current and best streaks, and monthly training volume to help users stay consistent and progressively improve over time.

---

## Project Structure

project-root/src/
- Frontend/ → React frontend
- Backend/ → Express backend

---

## Installation
Clone the repository
```bash
git clone https://github.com/Flurry2005/KineticEdge.git
```

---

## Project Setup

### 1. Go to root folder
```bash
cd project-root
```

### 2. Install dependencies
```bash
npm i
```

### 3. Basic Express server (src/Backend/server.ts)

````ts
import dotenv from "dotenv";
dotenv.config();

import { app } from "./express.ts";
import DatabaseConnection from "./services/Database.ts";

DatabaseConnection.connect(); //Establishes the connection to the database

const PORT: number = parseInt(process.env.PORT!) || 3000;

//Use "0.0.0.0" if server should listen to all interfaces, otherwise remove (localhost).
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

````

### 4. Running the project
```bash
npm run dev
```

---

## Connecting Frontend and Backend

All frontend has hardcoded api-urls pointing to localhost endpoints on the backend server.

You can call backend like:

```ts
fetch("http://localhost:3000/endpoint")
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Build for Production

Frontend:
```bash
npm run build
```

---

## Environment Variables

Create .env file in project-root:

```env
PORT = eg. 3000

DB_URL = mongodb+srv://<username>:<mongodblink>/<database>?appName=<AppName>

JWT_SECRET = asecuresecrectkey
WITHINGS_CLIENT_ID = ...
WITHINGS_REDIRECT_URI = ...
WITHINGS_CLIENT_SECRET = ...
NODE_ENV = ...
FRONTEND_URL = ...
```

Use it like:

```ts
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
```
