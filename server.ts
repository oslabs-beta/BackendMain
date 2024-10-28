// npx tsx server.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';
import cookieSession from 'cookie-session';
import path from 'path';
import { ServerError } from './server/type';
import sessionController from './server/controllers/sessionController';
import userController from './server/controllers/userController';
import openAiController from './server/controllers/openAiController';
import session from 'express-session';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT: number = 3008;

app.use(
  session({
    secret: 'fillerfornow',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);

app.use(
  cors({
    origin: 'http://localhost:8080/', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // Optional, if you're handling cookies or authentication tokens
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

app.post(
  '/api/openAi',
  openAiController.generateAiResponse,
  (req: Request, res: Response): void => {
    console.log('Response message:', res.locals.message);
    res.status(200).json({ response: res.locals.message });
  }
);

app.get(
  "/getUserQueries",
  userController.getUserQueries,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.userQueries);
  }
);

app.put(
  "/dataSource",
  userController.addDataSource,
  (req: Request, res: Response): void => {
    res
      .status(200)
      .json({ message: `successfully added DataSource to user profile` });
  }
);

app.post(
  "/addCategory",
  userController.addCategory,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.newCategory);
  }
);

app.post(
  "/addQuery",
  userController.addQueries,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.userQueries);
  }
);

app.delete(
  "/deleteQuery",
  userController.deleteQuery,
  (req: Request, res: Response): void => {
    res.status(200).json(res.locals.updatedQueries);
  }
);

app.delete("/deleteCategory", userController.deleteCategory, (req: Request, res: Response): void =>{
    res.status(200).json({message: 'Category has been deleted'})
})

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
