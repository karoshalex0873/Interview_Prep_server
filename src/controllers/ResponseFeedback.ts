import { GoogleGenerativeAI } from "@google/generative-ai";
import asyncHandler from "../midllewares/asyncHandler";
import { Request, Response } from "express";
import { UserRequest } from "../utils/types/Usertype";
import { AppDataSource } from "../config/data-source";
import { InterviewResponse } from "../Entities/interviewResponse";
import { Interview } from "../Entities/Interview";

// // defination of database entity
const interviewResponse = AppDataSource.getRepository(InterviewResponse)
const interviewRepo = AppDataSource.getRepository(Interview);

export const submitResponse = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      // 1. Authentication Check
      if (!req.user) {
        res.status(401).json({ error: "⚠ Access denied; not authenticated" });
        return
      }
      // 2. Validate and Parse Parameters
      const interviewId = Number(req.params.interviewId)
      if (isNaN(interviewId)) {
        res.status(400).json({ error: "❌ Invalid interview ID format" });
        return
      }
      // 3. Validate Request Body
      const { question, userResponse } = req.body;
      if (!question?.trim() || !userResponse?.trim()) {
        res.status(400).json({ message: "Question and user response are required" });
        return
      }
      // 4. Verify Interview Exists
      const interview = await interviewRepo.findOne({
        where: { interviewId },
        relations: ['user'],
        select:['interviewId','user']
      });
      if (!interview) {
        res.status(404).json({ message: "⚠ Interview not found" });
        return
      }
      // 5. Validate User Authorization
      if (!interview.user || interview.user.user_id !== req.user.user_id) {
        res.status(403).json({ message: "Unauthorized - you don't own this interview" });
        return
      }
      // 6. Intialize AI model and Valdate the API Key
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        res.status(500).json({ error: "Google API key is missing" });
        return
      }
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      // 7. Prompt Generative AI model
      const prompt = `   
        You are an AI interviewer analyzing a mock interview...
    
        **Transcript**  
        Question: ${question}  
        Response: ${userResponse} 
        
        Evaluate strictly using these rules:
        1. **Communication Skills (0-100)**: Clarity, structure, conciseness.  
        - 90-100: Fluent, logical flow, no fillers.  
        - 75-89: Minor hesitations or redundant phrases.  
        - 0-74: Disjointed or unclear.  
        2. **Technical Knowledge (0-100)**: Accuracy/depth of role-specific concepts.  
          - 90-100: Comprehensive + advanced insights.  
          - 75-89: Correct but superficial.  
          - 0-74: Incomplete or incorrect.  

        3. **Problem-Solving (0-100)**: Analytical approach & solution quality.  
          - 90-100: Structured framework + optimization.  
          - 75-89: Logical but lacks depth.  
          - 60-74: No clear methodology.
          - 0-59: No problem-solving skills.
          
        4. **Cultural Fit (0-100)**: Values alignment (score 0 if question irrelevant).  
          - 90-100: Demonstrates collaboration/ownership.  
          - 75-89: Generic but positive.  
          - 60-74: No evidence or negative tone.  
          - 50-59: No cultural fit or cultural bias.

        5. **Confidence (0-100)**: Poise and conviction.  
          - 90-100: Authoritative, no self-doubt.  
          - 75-89: Steady but unassertive.  
          - 60-74: Nervous or uncertain.
          - 0-59: Lack of confidence or unassertive.
        **Scoring System**  
          - **Overall Score**: Average of categories. Adjust weights by question type:  
            - Technical: Technical (50%), Problem-Solving (30%), Others (20%).  
            - Behavioral: Cultural Fit (40%), Communication (30%), Others (30%).  
          - **Penalties**:  
            - Non-answer (<15 words): Max 40 overall.  
            - Repetition: Deduct 5 points.  
            - Off-topic: Max 50 overall.
        
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
        - Bullet points other than improvement lis
      `;
      // 8. Generate AI response and feedback
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawFeedback = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "No feedback received";
      // 9. Process Feedback
      const feedbackArray = rawFeedback
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^- /, '').trim());
      // 10. Save the response in the database
      const newResponse = interviewResponse.create({
        question,
        userResponse,
        feedback:feedbackArray.join(' '),
        user: { user_id: req.user.user_id },
        interview: { interviewId }
      });
      await interviewResponse.save(newResponse);
      // 11. Send the AI response to the user
      return res.status(201).json({
        success: true,
        message: "Response submitted successfully",
        data: {
          responseId: newResponse.response_id,
          interviewId,
          question,
          feedback:feedbackArray,
          createdAt: newResponse.createdAt
        }
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      return res.status(500).json({ error: "Failed to generate AI response" });
    }
  }
);