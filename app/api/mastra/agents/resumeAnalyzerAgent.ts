// app/mastra/agents/resumeAnalyzerAgent.ts
import { Agent } from "@mastra/core";
import analyzeResumeTool from "../tools/analyzeResumeTool";
import { google } from "@ai-sdk/google"; 

const resumeAnalyzerAgent = new Agent({
  name: "ResumeAnalyzerAgent",
  description: "An agent that analyzes resume data and outputs it in JSON format.",
  instructions: "Please provide the resume text in the format 'Key: Value'.", // Add instructions
  model:google("gemini-2.5-flash"), // Correctly specify the gemini model as an array
  tools: {
    analyzeResume: analyzeResumeTool, // Use the tool as a record
  },
});

export default resumeAnalyzerAgent;