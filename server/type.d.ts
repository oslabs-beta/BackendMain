import { Request, Response, NextFunction, RequestHandler } from 'express';

export type ServerError = {
    log: string;
    status?: number;
    message: { err: string };
}

export type cookieController = {
    setCookie: (req: Request, res: Response, next: NextFunction) => void;
}

export type userController = {
    addUser: (req: Request, res: Response, next: NextFunction) => void;
}
