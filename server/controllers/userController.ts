import { Request, Response, NextFunction, RequestHandler } from 'express';
import { userController } from '../type';
const bcrypt = require('bycrpt');
const path = require('path');
const User = require(path.join(__dirname, '/models/userModel.ts'));



const userController = {} as userController;

userController.addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    //check to see if all required fields are present
    if( email === undefined || password === undefined ) {
         return next({
            log: 'Express error handler caught error in addUser Middleware',
            status: 400,
            message: {err: 'Missing one of the required fields(Email or Password)'},
        });
    }

    //check if there is already an account registerd with that username
    if(await User.findOne({email: email}) !== null){
        try {
            bcrypt 
            const result = await User.create( email, password );
            console.log(result);
            return  next()
        } catch (error) {
            const err = {
                log: 'Express error handler caught error in addUser Middleware: ' + error,
                status: 500,
                message: {err: 'Error creating user'},
            }
             return next(err);
        }
    }

    
};