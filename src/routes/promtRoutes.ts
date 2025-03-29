import express from 'express'
import { generateQuestions, getAllQuestions, submitResponse } from '../controllers/generateController'


//router
const router = express.Router()

//create a new post
router.post('/get',generateQuestions) 
router.get('/getall',getAllQuestions)
router.post('/response',submitResponse)

export default router