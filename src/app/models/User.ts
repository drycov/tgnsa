// import mongoose, { Schema } from "mongoose";

interface User {
  // _id: string; // Custom ID field
  is_bot: boolean;
  tgId: number;
  firstName: string;
  lastName: string;
  companyPost: string;
  phoneNumber: string;
  username: string;
  isAdmin: boolean;
  userAllowed: boolean;
  verificationCode: String;
  email: string;
  userVerified: boolean;
}

// const userSchema = new Schema<User>({
//   // _id: String, // Specify the type of your custom ID field
//   is_bot: Boolean,
//   tgId: Number,
//   firstName: String,
//   lastName: String,
//   companyPost: String,
//   phoneNumber: String,
//   username: String,
//   isAdmin: Boolean,
//   userAllowed: Boolean,
//   verificationCode: String,
//   email: String,
//   userVerified: Boolean,
// });

// const UserModel = mongoose.model<User>("User", userSchema);

// export default UserModel;

export default User;
