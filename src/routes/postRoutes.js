"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostControllers_1 = require("../controllers/PostControllers");
const router = express_1.default.Router();
// post request of the users post
router.post('/addPost', PostControllers_1.addPost);
exports.default = router;
