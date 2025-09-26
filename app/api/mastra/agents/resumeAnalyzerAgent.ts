import { Agent } from "@mastra/core";
import { google } from "@ai-sdk/google"; 
import { z } from "zod";

// --- 1. Define the Comprehensive Output Schema ---
// This schema dictates *exactly* what structured data and analysis the LLM must return.
const ResumeSchema = z.object({
  personal_info: z.object({
    name: z.string().describe("Full name of the candidate."),
    email: z.string().email().nullable().describe("Candidate's email address."),
    phone: z.string().nullable().describe("Candidate's phone number."),
    linkedin: z.string().url().nullable().optional(),
  }),
  experience: z.array(z.object({
    title: z.string().describe("Job title."),
    company: z.string().describe("Company name."),
    dates: z.string().describe("Date range (e.g., 'Jan 2022 - Present')."),
    summary_of_impact: z.string().describe("A 2-3 sentence summary of contributions, focusing on quantifiable impact and achievements, not just duties."),
  })).describe("Detailed list of work experiences."),
  education: z.array(z.object({
    degree: z.string().describe("Degree or qualification obtained."),
    institution: z.string().describe("Name of the school or university."),
    year_completed: z.number().nullable().optional().describe("Year of completion."),
  })).describe("Detailed education history."),
  technical_skills: z.array(z.string()).describe("A comprehensive list of programming languages, frameworks, and tools."),
  
  // --- This is the key for the 'Full Analysis' ---
  full_analysis_score: z.object({
    overall_score: z.number().int().min(1).max(10).describe("Overall quality and fit score of the resume (10 is perfect)."),
    gaps_and_flags: z.array(z.string()).describe("List any employment gaps, vague sections, or structural issues."),
    strengths: z.array(z.string()).describe("List 3-5 major strengths based on the experience."),
    recommendations: z.array(z.string()).describe("Suggest 2 areas where the candidate could improve the resume or skills."),
  }),
});

export type ResumeAnalysis = z.infer<typeof ResumeSchema>;


// --- 2. Define the Agent Configuration ---
const resumeAnalyzerAgent = new Agent({
  name: "ResumeAnalyzerAgent",
  description: "An expert recruiter AI for detailed resume analysis.",
  instructions: `
    You are a **Senior Recruiter and resume analysis expert**.
    Your task is to meticulously analyze the raw text provided from a candidate's resume.
    You must extract ALL required information and provide a comprehensive evaluation in the specified JSON format.
    Focus on extracting quantifiable achievements and identifying the candidate's core strengths and weaknesses.
    If a field is not found, use 'null' or an empty array [] to maintain the JSON structure.
  `, 
  model: google("gemini-2.5-flash"), 
});


// --- 3. Export the Callable Analysis Function ---
// This is the function you MUST call from your Hono backend.
export async function runResumeAnalysis(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `Perform a full, detailed analysis on the following resume text:\n\n---\n${resumeText}\n---`;
    
    // The key change: Use generate() with the output schema
    const result = await resumeAnalyzerAgent.generateVNext(prompt, {
        output: ResumeSchema, // Instruct the LLM to adhere to this Zod schema
    });
    
    // The Mastra Agent ensures the result is a valid object based on the schema
    return result.object; 
}


export default resumeAnalyzerAgent; // Export the agent configuration (optional, but standard)