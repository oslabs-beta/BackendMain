const Uri: string = `mongosh "mongodb+srv://userdatabase.dwlwu.mongodb.net/" --apiVersion 1 --username davidjs314 --password Djs314642763`

import mongoose, { Schema, Document } from 'mongoose';

mongoose.connect(Uri)
.then(() => console.log('Connected to The mongoose DB'))
.catch(err => console.log('Error when connecting to the mongo DB ' + err))

interface User extends Document {
    email: string,
    password: string,
}

const userSchema = new Schema<User>({
    email: { type: String, required: true },
    password: { type: String, required: true}
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;