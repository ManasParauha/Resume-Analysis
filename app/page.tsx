"use client"
import ResumeUpload from "@/components/ResumeUpload"
import ResumeAnalysisCard from "@/components/ResumeAnalysisCard"
import { useState } from "react"

export default function Home() {
   const [analysis, setAnalysis] = useState<Record<string, string> | null>(null)
 const handleFileUpload = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    // Step 1: Upload PDF and get parsed text
    const analyzeRes = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    })
    const analyzeData = await analyzeRes.json()
    console.log("Parsed Text:", analyzeData.parsedText)

    // Step 2: Send parsed text to Mastra AI
    const mastraRes = await fetch("/api/mastra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsedText: analyzeData.parsedText }),
    })
    const mastraData = await mastraRes.json()
    console.log("Mastra Analysis:", mastraData.analysis)
    setAnalysis(mastraData.analysis)

    // You can now update your UI with mastraData.analysis
  } catch (err) {
    console.error("File upload or analysis failed:", err)
  }
}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Resume Analyzer</h1>
      <ResumeUpload onUpload={handleFileUpload} />
      {analysis && <ResumeAnalysisCard analysis={analysis} />}
    </div>
  )
}
