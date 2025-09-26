"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Loader2 } from "lucide-react" // 🛑 Import Loader2 icon
import toast from "react-hot-toast"

interface ResumeUploadProps {
    onUpload: (file: File) => Promise<void>; // Use Promise<void> for the async handler
    isLoading: boolean; // 🛑 New prop for loading state
}

export default function ResumeUpload({ onUpload, isLoading }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile)
        } else {
            setFile(null);
            toast.error("Please select a valid PDF file.")
        }
    }

    const handleUpload = () => {
        if (file) {
            // Since the parent handles the async logic, we just call the prop function
            onUpload(file)
        } else {
            toast.error("Please select a file to upload.")
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <label htmlFor="resume-file" className="w-full"> {/* Use label for accessibility */}
                    <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-file"
                        disabled={isLoading} // 🛑 Disable input while loading
                    />
                    <div className={`flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                        <Upload className={`w-6 h-6 mr-2 ${isLoading ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="text-gray-600">
                            {file ? file.name : "Click to select PDF"}
                        </span>
                    </div>
                </label>

                <Button
                    onClick={handleUpload}
                    // 🛑 Disable button if no file is selected OR if loading
                    disabled={!file || isLoading} 
                    className="w-full text-lg h-10"
                >
                    {/* 🛑 Conditional Rendering for Loading State */}
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing... Please Wait
                        </>
                    ) : (
                        "Analyze Resume"
                    )}
                </Button>
                
                <p className="mt-2 text-xs text-gray-500">
                    Analysis may take 15-30 seconds.
                </p>
            </CardContent>
        </Card>
    )
}