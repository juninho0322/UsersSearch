/*
    User routes.

    Maps HTTP routes to controller functions.
    This file only defines routes for the users feature.
*/

import { Router } from "express";

import { listUsers } from "./user.controller.js";

/*
    Router for all user-related endpoints.
*/
export const userRouter = Router();

/*
    GET /api/users

    Returns a list of users.
*/
userRouter.get("/", listUsers);
