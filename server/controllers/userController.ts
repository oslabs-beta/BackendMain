import { Request, Response, NextFunction} from 'express';
import { userController } from '../type';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
const userController = {} as userController;

userController.addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { password, confirmPassword } = req.body;
  const email = req.body.email.toLowerCase().trim();
  if (password !== confirmPassword) {
    return next({
      log: "Passwords did not match for signup",
      message: "Passwords given do not match",
      status: 400,
    });
  }
    //check to see if all required fields are present
    if( email === undefined || password === undefined ) {
         return next({
            log: 'Express error handler caught error in addUser Middleware',
            status: 400,
            message: {err: 'Missing one of the required fields(Email or Password)'},
        });
    }
  //check if there is already an account registerd with that username
  const user = await User.findOne({ email: email });
  console.log(user, "user");
  if (user === null) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({ email, password: hashedPassword });
      console.log(newUser);
      return next();
    } catch (error) {
      console.log("create user error");
      const err = {
        log:
          "Express error handler caught error in addUser Middleware: " + error,
        status: 500,
        message: { err: "Error creating user" },
      };
      return next(err);
    }
  } else {
    return next({
      log: "Express error handler caught error in addUser Middleware",
      status: 400,
      message: { err: "Could not create account" },
    });
  }
};

userController.verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const password = req.body.password;
  const email = req.body.email.toLowerCase().trim();
  if (email === undefined || password === undefined) {
    return next({
      log: "Express error handler caught error in verifyUser Middleware",
      status: 400,
      message: { err: "Missing one of the required fields(Email or Password)" },
    });
  }
  const user = await User.findOne({ email: email });
  if (user) {
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user._id;
        console.log("session userId set to " + req.session.userId);
        return next();
      } else {
        return next({
          log: `password given was incorecct`,
          message: { err: `user authentication failed` },
          status: 400,
        });
      }
    } catch (error) {
      const err = {
        log:
          "Express error handler caught error in verifyUser Middleware: " +
          error,
        status: 500,
        message: { err: "user authentication failed!" },
      };
      return next(err);
    }
  } else {
    return next({
      log: "Cannot find user in verifyUser Middleware",
      status: 401,
      message: { err: "Error in verifying user" },
    });
  }
};

userController.getUserQueries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.session;

  try {
    const user = await User.findById(userId);
    if (user) {
      res.locals.userQueries = user.categories;
      return next();
    } else {
      return next({
        log: "User id not found",
        message: { err: "User id not found, please log in" },
        status: 400,
      });
    }
  } catch (error) {
    const err = {
      log:
        "Express error handler caught error in getUserQueries Middleware: " +
        error,
      status: 500,
      message: { err: "user session not found!" },
    };
    return next(err);
  }
};

userController.addDataSource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { datasource } = req.body;
  const { userId } = req.session;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { datasource: datasource },
      { new: true }
    );
    if (user) {
      res.locals.newDataSource = user.datasource;
      console.log(
        "successfully added data source- reslocals",
        res.locals.newDataSource
      );
      return next();
    } else {
      return next({
        log: `user not found, please sign up or log in`,
        message: { err: `user authentication failed` },
        status: 400,
      });
    }
  } catch (error) {
    const err = {
      log:
        "Express error handler caught error in addDataSource Middleware: " +
        error,
      status: 500,
      message: { err: "user authentication failed!" },
    };
    return next(err);
  }
};

userController.addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.session;
  const { category } = req.body;

  try {
    const newCategory = await User.findByIdAndUpdate(
      userId,
      { $set: { [`categories.${category}`]: [] } },
      { new: true }
    );

    if (newCategory) {
      res.locals.newCategory = newCategory.categories;
      return next();
    } else {
      return next({
        log: "User not found",
        message: { err: "Failed to add category, please try again" },
        status: 400,
      });
    }
  } catch (error) {
    const err = {
      log:
        "Express error handler caught error in addCategory Middleware: " +
        error,
      status: 500,
      message: { err: "user session not found!" },
    };
    return next(err);
  }
};

userController.addQueries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { category, query } = req.body;
  const { userId } = req.session;

  try {
    const userQuery = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $addToSet: { [`categories.${category}`]: query },
      },
      { new: true }
    );
    console.log("addedQuery: ", userQuery);
    if (userQuery) {
      res.locals.userQueries = userQuery.categories;
      return next();
    } else {
      return next({
        log: "User not found",
        message: { err: "Failed to add query, please try again" },
        status: 400,
      });
    }
  } catch (error) {
    const err = {
      log:
        "Express error handler caught error in addQueries Middleware: " + error,
      status: 500,
      message: { err: "user authentication failed!" },
    };
    return next(err);
  }
};

userController.deleteQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.session;
  const { category, query } = req.body;

  try {
    const deleteQ = await User.findOneAndUpdate(
      { _id: userId },
      {
        $pull: { [`categories.${category}`]: query },
      },
      { new: true }
    );
    if (deleteQ) {
      res.locals.updatedQueries = deleteQ.categories;
      return next();
    } else {
      return next({
        log: `Unable to delete query `,
        message: { err: `Query deleted failed` },
        status: 400,
      });
    }
  } catch (error) {
    const err = {
      log:
        "Express error handler caught error in deleteQuery Middleware: " +
        error,
      status: 500,
      message: { err: "user authentication failed!" },
    };
    return next(err);
  }
};

userController.deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { category } = req.body;
  const { userId } = req.session;

  try {
    const deleteC = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { [`categories.${category}`]: "" },
      },
      { new: true }
    );
    if (deleteC) {
      res.locals.updatedCategories = deleteC.categories;
      return next();
    } else {
      return next({
        log: "User not found",
        message: { err: "Failed to delete category, user not found" },
        status: 404,
      });
    }
  } catch (error) {
    const err = {
      log: `Express error handler caught error in deleteCategory Middleware: ${error}`,
      status: 500,
      message: { err: "Failed to delete category!" },
    };
    return next(err);
  }
};

export default userController;
