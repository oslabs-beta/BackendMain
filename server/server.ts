import { Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import { ServerError } from './type'
import cookieController from './controllers/cookieController'

const mongoose = require('mongoose');
const express = require('express');


const app = express();
const PORT: number = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req:Request, res:Response): Response => {
    return res.status(200).json('email/password authenticated')
})

app.post('/',(req: Request, res: Response): Response => {
    return res.status(201).json('new user has been created');
})  

app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
    const defaultErr: ServerError = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: {err: 'An error occured'},
    };
    const errorObj: ServerError = { ...defaultErr, ...err };
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
});


app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
});