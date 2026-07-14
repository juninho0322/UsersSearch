// app.ts builds the API server using Express.js and sets up middleware for JSON parsing and CORS handling.

import express from "express";
import cors from "cors";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";


export const app = express();

// parse incoming requests with JSON payloads
app.use(express.json());

// enable CORS for all routes
app.use(cors());

//test route
app.get("/", (req, res) => {
    res.json({
        message: "Hello World!"
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

//not found middleware
app.use(notFoundMiddleware);
 