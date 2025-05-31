import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Interview } from "../Entities/Interview";
import asyncHandler from "../midllewares/asyncHandler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRequest } from "../utils/types/Usertype";
import { User } from "../Entities/User";


const QuestionsInterview = AppDataSource.getRepository(Interview);

export const generateQuestions = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      //get user from userken
      if (!req.user) {
        return res.status(401).json({ error: "⚠ Access denied; not authenticated" });
      }
      const userId = req.user.user_id
      // Interview body destructuring
      const { role, level, techstack, type, amount } = req.body;
      // check if the GOOGLE_GEMINI_API_KEY exists
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return res.status(500).json({ error: "Google API key is missing" });
      }
      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      // Generate questions from promt
      const prompt = `Prepare ${amount} questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is: ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      Return only the questions, as raw plain text.
      Each question must be on a new line.
      Do not use JSON formatting, brackets, dashes, numbers, or any special characters.
      Do not include an introduction or summary.
      Example format:
      What are your strengths?
      Describe a challenging project you've worked on.
      How would you handle a technical issue in production?
      Thank you!`;
      //get the response to modify it before sending to the Database
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      // removing charcters
      const questions = text.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^- /, '').trim())
      // Find the user first
      const user = await User.findOne({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Create a new Interview instance
      const newInterview = QuestionsInterview.create({
        role,
        level,
        techstack,
        type,
        amount,
        questions,
        user, // Pass the entire user entity, not just { id: userId }
      });
      // Save to DB
      await QuestionsInterview.save(newInterview);
      //send the response
      return res.status(201).json({
        message: "Questions generated successfully",
        questions,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "⚠ An error occurred while generating questions" });
    }
  }
);



// get question based on the user who have creted them
export const getQuestion = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id
    if (!userId) {
      res.status(404).json({ message: "initilize your own Mock interview and get started" }
      )
    }
    // geting data from the datbase
    const questions = await Interview.find({ where: { user: { user_id: userId } } })
    res.status(200).json({ success: true, data: questions });
  })


// deleting the question from the database on which the user has cretaed the interview questions

export const deleteQuestion = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id
    const questionId = parseInt(req.params.id)
    if (!userId || !questionId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    // find the question
    const question = await Interview.findOne({
      where: { user: { user_id: userId }, interviewId: questionId },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    // delete the question
    await QuestionsInterview.delete({ interviewId: question.interviewId });
    return res.status(200).json({ message: "Question deleted successfully" });
  }
);


//update questions

export const updateQuestion = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id
    const questionId = parseInt(req.params.id)
    const { role, level, techstack, type, amount, questions } = req.body;
    if (!userId || !questionId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    // find the question
    const question = await Interview.findOne({
      where: { user: { user_id: userId }, interviewId: questionId },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    // update the question
    question.role = role;
    question.level = level;
    question.techstack = techstack;
    question.type = type;
    question.amount = amount;
    question.questions = questions;
    await QuestionsInterview.save(question);
    return res.status(200).json({ message: "Question updated successfully" });
  }
)










