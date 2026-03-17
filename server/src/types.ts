import { Request } from "express";

// Extend Express Request interface to include user property
export interface AuthRequest extends Request {
  user?: any;
}
