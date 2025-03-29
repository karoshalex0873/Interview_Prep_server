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
exports.generateQuestions = void 0;
const data_source_1 = require("../config/data-source");
const Questions_1 = require("../Entities/Questions");
const asyncHandler_1 = __importDefault(require("../midllewares/asyncHandler"));
const generative_ai_1 = require("@google/generative-ai");
const QuestionsInterview = data_source_1.AppDataSource.getRepository(Questions_1.Interview);
exports.generateQuestions = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { role, level, techStack, type, amount } = req.body;
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return res.status(500).json({ error: "Google API key is missing" });
    }
    // Initialize Google Generative AI
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // Generate content
    const prompt = `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techStack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `;
    const result = yield model.generateContent(prompt);
    const response = yield result.response;
    const text = (_f = (_e = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) !== null && _f !== void 0 ? _f : "";
    // Convert to array of questions
    const questions = text
        .split("\n")
        .map(q => q.trim().replace(/["'\-*_/\\]/g, "").replace(/^\d+\.\s*/, "")) // Remove special chars & numbering
        .filter(q => q.length > 5); // Ensure valid questions
    // Save to database
    const newInterview = QuestionsInterview.create({
        role,
        level,
        techStack,
        type,
        amount,
        questions,
    });
    yield QuestionsInterview.save(newInterview);
    res.status(201).json({
        message: "Questions generated successfully",
        questions,
    });
}));
