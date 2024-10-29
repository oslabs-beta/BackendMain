import { Request, Response, NextFunction, RequestHandler } from 'express';

export type ServerError = {
    log: string;
    status?: number;
    message: { err: string };
    success: boolean;
}

export type sessionController = {
    validateSession: (req: Request, res: Response, next: NextFunction) => void;
}

export type userController = {
    addUser: (req: Request, res: Response, next: NextFunction) => void;
    verifyUser: (req: Request, res: Response, next: NextFunction) => void;
}

export type githubOAuthController = {
    getAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    getUserData: (req: Request, res: Response, next: NextFunction) => void;
    validateJwtToken: (req: Request, res: Response, next: NextFunction) => void;
    refreshJwtToken: (req: Request, res: Response, next: NextFunction) => void;
}

export type googleOAuthController = {
    getAccessToken: (req: Request, res: Response, next: NextFunction) => void;
}




