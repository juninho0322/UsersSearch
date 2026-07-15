// app.ts builds the API server using Express.js and sets up middleware for JSON parsing and CORS handling.

import express from "express";
import cors from "cors";

import { apiRouter } from "./routes/index.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

export const app = express();

// parse incoming requests with JSON payloads
app.use(express.json());

// enable CORS for all routes
app.use(cors());

// mount the API router at the /api path
app.use("/api", apiRouter);

// Additional routes for testing and health checks

//test route
app.get("/", (req, res) => {
    res.json({
        message: "Hello World!",
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

// 404 after all routes
app.use(notFoundMiddleware);

// Error middleware must be last
app.use(errorMiddleware);
