import { NextFunction, Request, Response } from 'express';

/**
 * Wraps an async route handler to automatically catch errors and pass them to next()
 * This eliminates the need for try-catch blocks in route handlers
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(users);
 * }));
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export default asyncHandler;
