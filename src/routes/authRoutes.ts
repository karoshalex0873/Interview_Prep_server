import express from "express";
import { checkToken, loginUser, logoutUser, registerUser } from "../controllers/AuthControllers";
import { protect } from "../midllewares/auth/protect";



const router = express.Router();

// Route definition
router.post("/register",registerUser)
router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.get('/check',protect,checkToken)

export default router;
