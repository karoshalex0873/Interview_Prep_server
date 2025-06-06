import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { User } from "../Entities/User";
import { Interview } from "../Entities/Interview";
import { InterviewResponse, } from "../Entities/interviewResponse";


dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource(
  isProduction ?
    // Production configuration (Render)
    {
      type: "postgres",
      url: process.env.DB_URL,
      synchronize: true,
      logging: false,
      entities: [User, Interview, InterviewResponse],
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
          require: true
        }
      }
    }
    :
    // Local development configuration
    {
      type: "postgres",
      host: process.env.LOCAL_DB_HOST,
      port: parseInt(process.env.LOCAL_DB_PORT || '5432'),
      username: process.env.LOCAL_DB_USER,
      password: process.env.LOCAL_DB_PASSWORD,
      database: process.env.LOCAL_DB_NAME,
      synchronize: true,
      logging: false,
      entities: [User, InterviewResponse, Interview]
    }
);

// Initialize and test connection
