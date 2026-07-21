/*
    User routes.

    Maps HTTP routes to controller functions.
    This file only defines routes for the users feature.
*/

import { Router } from "express";

import {
    createUser,
    deleteUser,
    getUserById,
    listUsers,
    updateUser,
} from "./user.controller.js";

/*
    Router for all user-related endpoints.
*/
export const userRouter = Router();

/*
    GET /api/users
*/
userRouter.get("/", listUsers);

/*
    GET /api/users/:id
*/
userRouter.get("/:id", getUserById);

/*
    POST /api/users
*/
userRouter.post("/", createUser);

/*
    PATCH /api/users/:id
*/
userRouter.patch("/:id", updateUser);

/*
    DELETE /api/users/:id
*/
userRouter.delete("/:id", deleteUser);
