import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const analyzeResumeTool = createTool({
  id: "analyzeResume",
  description: "Analyzes resume text and returns structured data.",
  inputSchema: z.object({
    resumeText: z.string(), // Define the expected input schema
  }),
  execute: async ({ context }) => {
    const resumeText = context.resumeText; // Access the input from context

    const lines = resumeText.split('\n');
    const resumeData: { [key: string]: string } = {};

    lines.forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim());
      if (key && value) {
        resumeData[key] = value;
      }
    });

    return resumeData; // Return the structured data
  },
});

export default analyzeResumeTool;