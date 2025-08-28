import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    claims: {
      sub: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}
