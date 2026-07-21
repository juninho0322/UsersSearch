import type { RequestHandler } from "express";

import {
    createUser as createUserService,
    deleteUser as deleteUserService,
    findUserById,
    listUsers as listUsersService,
    updateUser as updateUserService,
} from "./user.service.js";

import {
    createUserBodySchema,
    listUsersQuerySchema,
    updateUserBodySchema,
    userIdParamSchema,
} from "./user.validation.js";

export const listUsers: RequestHandler = async (req, res, next) => {
    try {
        const query = listUsersQuerySchema.parse(req.query);

        const result = await listUsersService(query);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getUserById: RequestHandler = async (req, res, next) => {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        const user = await findUserById(id);

        res.status(200).json({
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        const input = createUserBodySchema.parse(req.body);

        const user = await createUserService(input);

        res.status(201).json({
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const { id } = userIdParamSchema.parse(req.params);
        const input = updateUserBodySchema.parse(req.body);

        const user = await updateUserService(id, input);

        res.status(200).json({
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const { id } = userIdParamSchema.parse(req.params);

        await deleteUserService(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
