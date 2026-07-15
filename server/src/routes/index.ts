/*
    API routes.

    Groups all feature routes under a single API router.
*/

import { Router } from "express";

import { userRouter } from "../modules/users/user.routes.js";

/*
    Root router for the API.
*/
export const apiRouter = Router();

/*
    User routes.

    /users -> user.routes.ts
*/
apiRouter.use("/users", userRouter);
