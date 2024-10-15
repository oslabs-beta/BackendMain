import { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid'
import { sessionController } from '../type'
import User from '../models/userModel';

const sessionController = {} as sessionController;

sessionController.validateSession  = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.session.userID
    if(userId) {
        const user = await User.findOne({_id: userId});
        if(userId === user._id) {
            return next();
        }
        return next({log: 'Invalid Session'});
    }
    return next({log: `No Session UserId found.`});
}

export default sessionController;