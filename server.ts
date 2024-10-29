import { Request, Response, NextFunction } from 'express';
import { ServerError } from './server/type';
import sessionController from './server/controllers/sessionController';
import userController from './server/controllers/userController';
import githubOAuthController from './server/controllers/githubOAuthController';
import googleOAuthController from './server/controllers/googleOAuthController';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT: number = 3008;
// const MongoDBSessionStore = MongoDBStore(session);
// const store = new MongoDBSessionStore({
//     uri:Uri,
//     collection:'mySessions'
// });
// store.on('error', (error) => {
//     console.log(error,"store error");
// });
app.use(cors({
    origin: 'http://localhost:8080', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true // Optional, if you're handling cookies or authentication tokens
}));
app.use(session({
    secret: 'fillerfornow',
    resave: false,
    saveUninitialized: false,
    // store:store,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30, // 30 minutes
        sameSite: 'lax', // 'lax' allows cookies to be sent with redirects from GitHub/Facebook/Google.
        path: '/' //ensuring cookie can be valid to every path
    }
}));

// app.use((req: Request, res: Response, next: NextFunction) => {
//     console.log('Session ID:', (req as any).sessionID);
//     console.log('Session Data:', req.session);
//     next();
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//get AccessToken
//code passed from frontend
app.get('/getAccessToken', githubOAuthController.getAccessToken, (req:Request, res:Response):void => {
    res.status(200).json({success:true, message:"get github accessToken successfully", access_token:res.locals.access_token})
});
//getUserData
//accessToken being passed as Authorization Header

app.post('/api/signin', userController.verifyUser, (req:Request, res:Response): void => { 
    res.status(200).json({success: true, message: 'Login verified'});
});

app.post('/api/signup', userController.addUser, (req: Request, res: Response): void => {
    res.status(201).json({success: true, message: 'Account Created'});
}); 


app.get('/getUserData', githubOAuthController.getUserData, (req: Request, res: Response): void => {
    res.status(200).json({success:true, message: "successfully getting userData", jwtToken: res.locals.jwtToken, refreshToken:res.locals.refreshToken })
});

app.get('/api/sessionUp', sessionController.validateSession, (req: Request, res: Response): void => {
    res.sendStatus(200);
});

app.get('/api/githubJwtValidation', githubOAuthController.validateJwtToken, (req: Request, res: Response): void => {
    res.status(200).json({success:true, message: "successfully verifying jwt token", userData: res.locals.user })
});

app.post('/api/githubRefreshJwtToken', githubOAuthController.refreshJwtToken, (req: Request, res: Response): void => {
    res.status(200).json({success:true, message: "successfully refreshing jwt token", newJwt: res.locals.newJwt })
});

app.post('/google/oauth/token', googleOAuthController.getAccessToken, (req: Request, res: Response): void => {
    res.status(200).json({success:true, message: "successfully getting google accessToken", googleToken:res.locals.googleToken })
});

app.use((err: ServerError, req: Request, res: Response): void => {
    const defaultErr: ServerError = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: {err: 'An error occurred'},
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