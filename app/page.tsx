"use client"
import ResumeUpload from "@/components/ResumeUpload"

export default function Home() {
  const handleFileUpload = async(file: File) => {
     const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("Backend response:", data.parsedText)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Resume Analyzer</h1>
      <ResumeUpload onUpload={handleFileUpload} />
    </div>
  )
}
