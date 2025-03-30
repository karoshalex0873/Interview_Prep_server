"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./config/data-source");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const promtRoutes_1 = __importDefault(require("./routes/promtRoutes"));
dotenv_1.default.config();
//instace of express
const app = (0, express_1.default)();
// connect to the database
// load port from .env
const PORT = process.env.PORT;
// middleware to parse json request bodies
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('', (req, res) => {
    res.send("Welcome to the server !");
});
// Authentication router
app.use('/api/v1/auth', authRoutes_1.default);
//router for post
// app.use('/api/v1/post',postRoutes)
//router for questions
app.use('/api/v1/questions', promtRoutes_1.default);
data_source_1.AppDataSource.initialize()
    .then(() => console.log("🚀 Database connected succsefully"))
    .catch((error) => console.log("Database connection error:", error));
// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
