import { Request, Response, NextFunction } from 'express';
import { googleOAuthController } from '../type';
import { URLSearchParams } from 'url';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const googleOAuthController = {} as googleOAuthController;
googleOAuthController.getAccessToken =  (req: Request, res: Response, next: NextFunction): void => {
  const {type, code, googleRefreshToken} = req.body;
  // data type: application/x-www-form-urlencoded 
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:type
  });
  if(code && type === 'authorization_code') {
    params.append("code", code);
    params.append("redirect_uri", GOOGLE_REDIRECT_URI);
  } else if(googleRefreshToken && type === 'refresh_token') {
    params.append("refresh_token", googleRefreshToken);
  } else {
    return next({
      log: "Invalid request parameters",
      message: { err: "Invalid request parameters" },
    })
  }
  fetch('https://oauth2.googleapis.com/token', {
    method:'POST',
    headers:{
      'Content-Type':"application/x-www-form-urlencoded"
    },
    body:params.toString()
  }).then(response => {
    if(!response.ok) {
      return next({
        log:"Failed to exchange code for token",
        message: {err: "Failed to exchange code for token"}
      })
    }
    return response.json();
  })
    .then(data => {
      res.locals.googleToken = data;
      return next();
    })
    .catch(error=> {
      console.log(error,"error in fetching token");
      return next({
        message:{err:"Internal Server Error"+error}
      })
    }) 
};
export default googleOAuthController;