// components/ResumeAnalysisCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ResumeAnalysisProps {
  analysis: Record<string, string>
}

export default function ResumeAnalysisCard({ analysis }: ResumeAnalysisProps) {
  return (
    <Card className="w-full max-w-xl mx-auto my-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Resume Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(analysis).map(([key, value]) => (
          <div key={key} className="flex gap-10 justify-between border-b py-1">
            <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
            <span className="text-gray-700">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
