"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generateController_1 = require("../controllers/generateController");
//router
const router = express_1.default.Router();
//create a new post
router.post('/get', generateController_1.generateQuestions);
exports.default = router;
