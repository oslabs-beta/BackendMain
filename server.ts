import { Request, Response, NextFunction, RequestHandler } from 'express';
import cookieSession from 'cookie-session';
import path from 'path';
import { ServerError } from './server/type';
import sessionController from './server/controllers/sessionController';
import userController from './server/controllers/userController';
import session from 'express-session';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';


const app = express();
const PORT: number = 3001;

app.use(cors({
    origin: 'http://localhost:3002', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true // Optional, if you're handling cookies or authentication tokens
}));

app.use(session({
    secret: 'fillerfornow',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30 // 30 minutes
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.post('/api/signin', userController.verifyUser, (req:Request, res:Response): void => { 
         res.status(200).json({success: true, message: 'Login verified'});
});

app.post('/api/signup', userController.addUser, (req: Request, res: Response): void => {
    res.status(201).json({success: true, message: 'Account Created'});
}); 

app.get('/sessionUp', sessionController.validateSession, (req: Request, res: Response): void => {
    res.sendStatus(200);
});

app.use((err: ServerError, req: Request, res: Response, next: NextFunction): void => {
    const defaultErr: ServerError = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: {err: 'An error occured'},
        success:  false,
    };
    const errorObj: ServerError = { ...defaultErr, ...err };
    console.log(errorObj.log);
    if (errorObj.status !== undefined) {
        res.status(errorObj.status).json(errorObj.message);
    }
});


app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
});