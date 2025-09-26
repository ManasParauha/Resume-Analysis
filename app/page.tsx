"use client"
import ResumeUpload from "@/components/ResumeUpload" // We will update this component
import ResumeAnalysisCard from "@/components/ResumeAnalysisCard"
import { useState } from "react"
import { ResumeAnalysis } from "@/Types/ResumeAnalysis" 
import toast from "react-hot-toast" // Assuming you use ShadCN toasts for errors

export default function Home() {
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
    const [loading, setLoading] = useState(false) //  NEW: Loading state
    

    const handleFileUpload = async (file: File) => {
        setLoading(true) //  START LOADING
        setAnalysis(null) // Clear previous analysis
        
        try {
            const formData = new FormData()
            formData.append("file", file)

            // Step 1: Upload PDF and get parsed text
            const analyzeRes = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            })
            
            if (!analyzeRes.ok) {
                const errorData = await analyzeRes.json()
                throw new Error(errorData.error || "Failed to parse PDF.")
            }
            
            const analyzeData = await analyzeRes.json()
            console.log("Parsed Text:", analyzeData.parsedText)

            if (!analyzeData.parsedText) {
                throw new Error("PDF parsing returned no text. The file may be corrupt or secured.")
            }

            // Step 2: Send parsed text to Mastra AI
            const mastraRes = await fetch("/api/mastra", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parsedText: analyzeData.parsedText }),
            })
            
            if (!mastraRes.ok) {
                const errorData = await mastraRes.json();
                console.error("Mastra API Error:", errorData);
                throw new Error("Mastra analysis failed on the server.");
            }

            const mastraData = await mastraRes.json()
            console.log("Mastra Analysis:", mastraData.analysis)
            
            setAnalysis(mastraData.analysis as ResumeAnalysis)
            
           toast.success(" Analysis Complete!")

        } catch (err: unknown) {
             console.error("File upload or analysis failed:", err)
             toast.error("Analysis Failed")
        } finally {
            setLoading(false) //  STOP LOADING, regardless of success or error
        }
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
                AI-Powered Resume Analyzer
            </h1>
            <div className="max-w-xl mx-auto mb-8">
                {/* 🛑 Pass the loading state down */}
                <ResumeUpload onUpload={handleFileUpload} isLoading={loading} />
            </div>
            
            {analysis && <ResumeAnalysisCard analysis={analysis} />}
            
            {/* Display a clear message while loading */}
            {loading && (
                 <div className="text-center mt-8 text-lg font-medium text-blue-600">
                    Running analysis... Please wait, this may take up to 30 seconds.
                 </div>
            )}
        </div>
    )
}