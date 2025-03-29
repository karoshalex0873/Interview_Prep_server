"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const asyncHandler_1 = __importDefault(require("../midllewares/asyncHandler"));
const data_source_1 = require("../config/data-source");
const User_1 = require("../Entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// User repository
const userDef = data_source_1.AppDataSource.getRepository(User_1.User);
exports.registerUser = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Destructure request body
    const { name, email, password } = req.body;
    // Check if user exists
    const userExists = yield userDef.findOne({ where: { email } });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }
    // Hash user's password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    // Create new user
    const newUser = userDef.create({
        name,
        email,
        password: hashedPassword,
    });
    // Save user in the database
    yield userDef.save(newUser);
    // Send response
    return res.status(201).json({
        message: "User created successfully",
        user: newUser,
    });
}));
