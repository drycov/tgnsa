// import mongoose, { Schema } from "mongoose";

interface User {
  // _id: string; // Custom ID field
  is_bot: boolean;
  ttc_id: string;
  station: string;
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
  apiToken: string;
  hash:string;
}

export default User;
// is_bot: boolean;
// ttc_id: string;
// station: string;
// tgId: number;
// firstName: string;
// lastName: string;
// companyPost: string;
// phoneNumber: string;
// username: string;
// isAdmin: boolean;
// userAllowed: boolean;
// verificationCode: String;
// email: string;
// userVerified: boolean;
// apiToken: string;