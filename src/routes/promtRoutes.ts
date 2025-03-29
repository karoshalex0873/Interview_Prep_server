import express from 'express'
import { generateQuestions, getAllQuestions } from '../controllers/generateController'


//router
const router = express.Router()

//create a new post
router.post('/get',generateQuestions) 
router.get('/getall',getAllQuestions)

export default router