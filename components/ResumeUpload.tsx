"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function ResumeUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    } else {
      toast.error("Please select a valid PDF file.")
    }
  }

  const handleUpload = () => {
    if (file) {
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
        <label className="w-full">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file"
          />
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
            <Upload className="w-6 h-6 mr-2 text-gray-500" />
            <span className="text-gray-600">
              {file ? file.name : "Click to select PDF"}
            </span>
          </div>
        </label>

        <Button
          onClick={handleUpload}
          disabled={!file}
          className="w-full"
        >
          Analyze Resume
        </Button>
      </CardContent>
    </Card>
  )
}
