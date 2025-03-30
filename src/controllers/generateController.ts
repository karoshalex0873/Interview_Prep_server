import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Interview } from "../Entities/Interview";
import asyncHandler from "../midllewares/asyncHandler";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { questionsRequest } from "../utils/types/questions";
import { ResponseRequest } from "../utils/types/response";






const QuestionsInterview = AppDataSource.getRepository(Interview);

export const generateQuestions = asyncHandler(
  async (req: questionsRequest, res: Response) => {
    const { role, level, techstack, type, amount } = req.body;


    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ error: "Google API key is missing" });
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate content
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


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";


    const questions = text.split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^- /, '').trim());



    // Save to database
    const newInterview = QuestionsInterview.create({
      role,
      level,
      techstack,
      type,
      amount,
      questions,
    });


    await QuestionsInterview.save(newInterview);

    res.status(201).json({
      message: "Questions generated successfully",
      questions,
    });
  }
);

//get all only

export const getAllQuestions = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await QuestionsInterview.find()
    res.status(200).json({ result });
  }
);





export const submitResponse = asyncHandler(
  async (req: ResponseRequest, res: Response) => {
    const { question, userResponse } = req.body;

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ error: "Google API key is missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    //promt for feed back
    const prompt = `   
    You are an AI interviewer analyzing a mock interview...

    **Transcript**  
    Question: ${question}  
    Response: ${userResponse} 
    
    **Evaluation Framework**
    1. Communication Skills (0-100): Clarity, articulation, organization
    2. Technical Knowledge (0-100): Role-specific concept mastery
    3. Problem-Solving (0-100): Solution quality & analytical approach
    4. Cultural Fit (0-100): Values alignment & team compatibility 
    5. Confidence (0-100): Poise, conviction, engagement level
    
    **Scoring System**
    - 90-100: Exceptional demonstration
    - 75-89: Strong with minor gaps
    - 60-74: Adequate but needs refinement
    - 40-59: Partial understanding shown
    - 0-39: Deficient or irrelevant
    
    **Output Requirements**
    1. Strict plain text format
    2. Numerical scores only (no symbols)
    3. Follow exact sequence:
       Communication Skills: [number]
       Technical Knowledge: [number]
       Problem-solving: [number]
       Cultural Fit: [number]
       Confidence: [number]
       Overall Score: [number]
       Detailed Assessment: [3-line analysis]
       Critical Improvements: 
       - Improvement 1
       - Improvement 2
       - Improvement 3
    
    **Calculation Rules**
    - Overall = Average of 5 category scores
    - Zero-tolerance: Assign 0 for non-answers
    - Partial credit: Deduct 20-40 points for incomplete responses
    
    **Example Valid Output**
    Communication Skills: 82
    Technical Knowledge: 75
    Problem-solving: 68
    Cultural Fit: 70
    Confidence: 65
    Overall Score: 72
    Detailed Assessment: The response demonstrates competent communication but lacks technical depth. Problem-solving approach shows basic structure but misses optimization considerations. Cultural alignment needs clearer examples.
    Critical Improvements:
    - Develop framework-based problem solving
    - Research company's technical stack
    - Practice STAR response format
    
    **Prohibited Elements**
    - Slashes (/) or special characters
    - Markdown formatting
    - Subjective adjectives without justification
    - Score percentages (use integers only)
    - Bullet points other than improvement list
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawFeedback = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "No feedback received.";

    // Convert to array for text-to-speech
    const feedbackArray = rawFeedback
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^- /, '').trim());

    res.status(200).json({
      message: "Response evaluated successfully",
      feedback: feedbackArray
    });
  }
);
