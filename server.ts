// npx tsx server.ts
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
import cookieSession from 'cookie-session';
import path from 'path';
import openAiController from './server/controllers/openAiController';
import mongoose from 'mongoose';

const app = express();
const PORT: number = 3008;
app.use(
  cors({
    origin: '*', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // Optional, if you're handling cookies or authentication tokens
  })
);

const secret: string = process.env.SECRET;

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post(
  '/api/signin',
  userController.verifyUser,
  (req: Request, res: Response): void => {
    res.status(200).json({ success: true, message: 'Login verified' });
  }
);

app.post(
  '/api/signup',
  userController.addUser,
  (req: Request, res: Response): void => {
    res.status(201).json({ success: true, message: 'Account Created' });
  }
);

app.get(
  '/api/sessionUp',
  sessionController.validateSession,
  (req: Request, res: Response): void => {
    res.sendStatus(200);
  }
);

app.get('/api/logout', (req: Request, res: Response) => {
  res.clearCookie('connect.sid').sendStatus(200);
});

//get github AccessToken
//code passed from frontend
app.get(
  '/getAccessToken',
  githubOAuthController.getAccessToken,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'get github accessToken successfully',
      access_token: res.locals.access_token,
    });
  }
);

//github getUserData
//accessToken being passed as Authorization Header

app.get(
  '/getUserData',
  githubOAuthController.getUserData,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'successfully getting userData',
      jwtToken: res.locals.jwtToken,
      refreshToken: res.locals.refreshToken,
    });
  }
);

app.get(
  '/api/githubJwtValidation',
  githubOAuthController.validateJwtToken,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'successfully verifying jwt token',
      userData: res.locals.user,
    });
  }
);

app.post(
  '/api/githubRefreshJwtToken',
  githubOAuthController.refreshJwtToken,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'successfully refreshing jwt token',
      newJwt: res.locals.newJwt,
    });
  }
);

//get google accessToken and refresh google access token
app.post(
  '/google/oauth/token',
  googleOAuthController.getAccessToken,
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'successfully getting google accessToken',
      googleToken: res.locals.googleToken,
    });
  }
);

app.post(
  '/api/openAi',
  openAiController.generateAiResponse,
  (req: Request, res: Response): void => {
    console.log('Response message:', res.locals.message);
    res.status(200).json({ response: res.locals.message });
  }
);

app.get(
  '/api/getUserQueries',
  userController.getUserQueries,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.userQueries);
  }
);

app.put(
  '/api/dataSource',
  userController.addDataSource,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.newDataSource);
  }
);

app.post(
  '/api/addCategory',
  userController.addCategory,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.newCategory);
  }
);

app.post(
  '/api/addQuery',
  userController.addQueries,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.userQueries);
  }
);

app.delete(
  '/api/deleteQuery',
  userController.deleteQuery,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.updatedQueries);
  }
);

app.delete(
  '/api/deleteCategory',
  userController.deleteCategory,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.updatedCategories);
  }
);

app.use(
  (err: ServerError, req: Request, res: Response, next: NextFunction): void => {
    const defaultErr: ServerError = {
      log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: { err: 'An error occured' },
      success: false,
    };
    const errorObj: ServerError = { ...defaultErr, ...err };
    console.log(errorObj.log);
    if (errorObj.status !== undefined) {
      res.status(errorObj.status).json(errorObj.message);
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
