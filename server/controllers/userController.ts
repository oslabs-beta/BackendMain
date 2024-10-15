import { Request, Response, NextFunction, RequestHandler } from 'express';
import { userController } from '../type';
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt';
import path from 'path';
import User from '../models/userModel';



const userController = {} as userController;

userController.addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, confirmPassword } = req.body;

    if(password !== confirmPassword){
        return next({log: 'Passwords did not match for signup', message: 'Passwords given do not match', status: 400})
    }

    console.log('reached adduser')
    //check to see if all required fields are present
    if( email === undefined || password === undefined ) {
         return next({
            log: 'Express error handler caught error in addUser Middleware',
            status: 400,
            message: {err: 'Missing one of the required fields(Email or Password)'},
        });
    }

    //check if there is already an account registerd with that username
    const user = await User.findOne({email: email});
    console.log(user);
    if(user === null){
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = await User.create( {email , password: hashedPassword });
            console.log(newUser);
            return next()
        } catch (error) {
            const err = {
                log: 'Express error handler caught error in addUser Middleware: ' + error,
                status: 500,
                message: {err: 'Error creating user'},
            }
             return next(err);
        }
    } 
    else {
        return next({
            log: 'Express error handler caught error in addUser Middleware',
            status: 400,
            message: {err: 'Could not create account'},
        })
    }   
};

userController.verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    
    if( email === undefined || password === undefined ) {
        return next({
           log: 'Express error handler caught error in addUser Middleware',
           status: 400,
           message: {err: 'Missing one of the required fields(Email or Password)'},
       });
   }
   const user = await User.findOne({email: email});
   if(user) {
    try {
        const match = await bcrypt.compare(password, user.password)
        if(match) {
            req.session.userId = user._id;
            return next();
        }
        else {
            return next({log: `password given was incorecct`, message: {err: `user authentication failed`}, status: 400})
        }
    } catch (error) {
        const err = {
            log: 'Express error handler caught error in verifyUser Middleware: ' + error,
            status: 500,
            message: {err: 'user authentication failed!'},
        }
    }
}
}

export default userController;