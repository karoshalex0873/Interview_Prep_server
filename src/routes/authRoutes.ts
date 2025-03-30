import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/AuthControllers";



const router = express.Router();

// Route definition
router.post("/register",registerUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)

export default router;
