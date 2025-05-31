import express from 'express'
import { deleteQuestion, generateQuestions, getQuestion} from '../controllers/Questions'
import { protect } from '../midllewares/auth/protect'
import { submitResponse } from '../controllers/ResponseFeedback'


//router
const router = express.Router()

//create a new post
router.post('/get',protect,generateQuestions) 
router.get('/getall',protect,getQuestion)
router.delete('/delete/:id',protect,deleteQuestion)
router.post( '/:interviewId/responses',protect,submitResponse
);
export default router