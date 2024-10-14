import { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid'
import { cookieController } from '../type'

const cookieController = {} as cookieController;

cookieController.setCookie  = (req: Request, res: Response, next: NextFunction): void => {
    const sessionId = uuidv4();
    res.cookie('session_id', sessionId), {
        httpOnlly: true,
        secure: true,
        maxAge: 30 * 60 * 1000,
    }
    return next();
}

export default cookieController;