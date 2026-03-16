import envConfig from "./config/env.config.js";
import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";


// Configurations & Routes
import { corsOptions } from "./config/cors.config.js";
import apiRouter from "./routes/index.js"; // The "Master" router

const app: Application = express();
const PORT = envConfig.PORT;

// Global Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Health Check 
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// API Routes
app.use("/v1/api", apiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});