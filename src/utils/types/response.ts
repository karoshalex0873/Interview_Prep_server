import { Request } from "express";

export interface ResponseRequest extends Request {
  body: {
    question: string;
    userResponse: string;
  };
}