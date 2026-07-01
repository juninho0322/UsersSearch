/*
    Custom error class for handling expected application errors.

    This class extends JavaScript's built-in Error class and adds
    extra information such as an HTTP status code, a stable error
    code, and optional details.

    The global error-handling middleware can use this information
    to return consistent API responses.
*/

export class AppError extends Error {
    constructor(
        // TypeScript shorthand that automatically creates and
        // initializes these class properties.
        //
        // Equivalent to:
        // this.statusCode = statusCode;
        // this.code = code;
        // this.details = details;
        //
        // readonly makes these properties immutable after creation.
        public readonly statusCode: number,
        public readonly code: string,
        public readonly details?: unknown,

        // Human-readable error message.
        // This belongs to the built-in Error class, so it is passed
        // to the parent constructor instead of becoming a property
        // of AppError itself.
        message?: string
    ) {
        // Calls the parent Error constructor.
        // If no message is provided, the error code is used instead.
        super(message ?? code);

        // Overrides the default error name ("Error") to make debugging clearer.
        this.name = "AppError";

        // Fixes JavaScript's prototype chain so that
        // `error instanceof AppError` works correctly.
        Object.setPrototypeOf(this, AppError.prototype);
    }
}