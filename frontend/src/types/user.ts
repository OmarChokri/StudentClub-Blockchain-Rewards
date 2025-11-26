// types/user.ts

export type Role = "admin" | "member";

export interface User {
  _id: string;           // MongoDB ObjectId is a string
  username: string;      // matches backend `username`
  email: string;
  password?: string;     // only used in forms or login
  role: Role;
  walletAddress: string; // required by backend
  points?: number;       // only for members
  createdAt?: string;    // optional, ISO string
}
