import dotenv from "dotenv";
dotenv.config();

const dbpassword: string = process.env.DB_PASS;
const Uri: string = `mongodb+srv://davidjs314:${dbpassword}@userdatabase.dwlwu.mongodb.net/?retryWrites=true&w=majority&appName=UserDatabase`;

import mongoose, { Schema, Document } from "mongoose";

mongoose
  .connect(Uri)
  .then(() => console.log("Connected to The mongoose DB"))
  .catch((err) => console.log("Error when connecting to the mongo DB " + err));

interface User extends Document {
  email: string;
  password: string;
  datasource?: string;
  categories?: {
    [key: string]: string[];
  };
}

const userSchema = new Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  datasource: {
    type: String,
    required: false,
    default: "http://localhost:9090/api/v1/query?query=",
  },
  categories: {
    type: Map,
    of: [String],
    required: false,
  },
});

const UserModel = mongoose.model<User>("User", userSchema);

export default UserModel;
