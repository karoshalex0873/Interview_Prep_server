import {Request} from "express"

export interface User{
  user_id:number
  name:string
  email:string
  password?:string
  createdAt?:Date
  updatedAt?: Date;
}

export interface UserRequest extends Request {
  user?: User;
}