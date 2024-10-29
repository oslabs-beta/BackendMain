import { Request, Response, NextFunction } from 'express';
import { githubOAuthController } from '../type';
const githubOAuthController = {} as githubOAuthController;
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
githubOAuthController.getAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  const {code} = req.query;
  const params = `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`;
  fetch(`https://github.com/login/oauth/access_token${params}`, {
    method: "POST",
    headers: {
      "Accept":"application/json"
    }
  }).then(response => response.json())
    .then(data => {
      console.log(data,"accessToken data");
      res.locals.access_token = data.access_token;
      next();
    })
    .catch(error => {
      return next({
        message: {err: 'Error in getting accessToken in github' + error},
      })
    });
};
//getUserData
//access token passed in Authorization header
githubOAuthController.getUserData = (req: Request, res: Response, next: NextFunction): void => {
  fetch('https://api.github.com/user', {
    method:'GET',
    headers: {
      "Authorization": req.get("Authorization") //Bearer AccessToken
    }
  })
  .then(response => response.json())
  .then(data => {
    //generate jwtToken & refreshJwtToken according to userData
    const jwtToken = jwt.sign({id: data.id, username: data.username}, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({id:data.id, username: data.username}, REFRESH_TOKEN_SECRET, {expiresIn: '1d' })
    res.locals.jwtToken = jwtToken;
    res.locals.refreshToken = refreshToken;
    next();
  })
  .catch( error => {
    return next({
      log:"error in get user data",
      status: 401,
      message: {err: 'error in get user data'+ error}
    })
  })
};

githubOAuthController.validateJwtToken = (req: Request, res: Response, next: NextFunction): void => {
  const jwtToken = req.get("Authorization").split(" ")[1];
  jwt.verify(jwtToken, JWT_SECRET, (error, decoded) => {
    if(error) {
      if(error.name === "TokenExpiredError") {
        return next({
          log:"jwtToken has expired",
          status: 401,
          message: {err: 'jwtToken has expired'+ error}
        })
      } 
      return next({
        log:"invalid Token",
        status:403,
        message: {err: 'invalid Token'}
      })
    }
    res.locals.user = decoded;
    next();
  })
};

githubOAuthController.refreshJwtToken = (req: Request, res: Response, next: NextFunction): void => {
  const refreshJwtToken = req.get("Authorization").split(" ")[1];
  if(!refreshJwtToken) {
    return next({
      log:"missing refresh jwtToken in header",
      status: 401,
      message: {err: 'missing refresh jwtToken in header'}
    })
  }
  jwt.verify(refreshJwtToken, REFRESH_TOKEN_SECRET, (error, decoded) => {
    if(error) {
      console.log(error, "error in verifying jwt with refresh Token");
      return next({
        log:"have trouble verifying refresh jwt",
        status: 401,
        message: {err: 'failed in verifying refresh jwt'}
      })
    }
    //make sure decoded's type is JwtPayload instead of string(typescript may think decoded's type is either JwtPayload or string)
    if(typeof decoded !== "string" && decoded.id) {
      //when creating newJwt token, should use jwt_secret instead of refreshingJwt secret, or you will get an invalid token
      const newJwt = jwt.sign({id:decoded.id}, JWT_SECRET, {expiresIn: '1h'});
      res.locals.newJwt = newJwt;
      next();
    } else {
      return next({
        log:'Invalid Token Structure',
        status:400,
        message: {err: 'Invalid Token Structure'}
      })
    }
  })
};

export default githubOAuthController;