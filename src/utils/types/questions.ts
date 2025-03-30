import { Request } from "express";


export interface questionsRequest extends Request {
  body: {
    role: string;
    level: string;
    techstack: string;
    type: string;
    amount: number;
    questions: string[];
  };
}

