"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../Entities/User");
const Interview_1 = require("../Entities/Interview");
const Response_1 = require("../Entities/Response");
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
exports.AppDataSource = new typeorm_1.DataSource(isProduction ?
    // Production configuration (Render)
    {
        type: "postgres",
        url: process.env.DB_URL,
        synchronize: true,
        logging: false,
        entities: [User_1.User, Interview_1.Interview, Response_1.Response],
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
            entities: [User_1.User, Response_1.Response, Interview_1.Interview]
        });
// Initialize and test connection
