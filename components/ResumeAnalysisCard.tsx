import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ResumeAnalysis , ExperienceItem, EducationItem } from "@/Types/ResumeAnalysis" //  Import the correct type

interface ResumeAnalysisProps {
  analysis: ResumeAnalysis; // Updated to use the full structured type
}

// Helper function to format keys (e.g., 'summary_of_impact' -> 'Summary of Impact')
const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// --- Sub-Component for Rendering Detail Items (Experience, Education) ---
const DetailItem = ({ item }: { item: ExperienceItem | EducationItem }) => (
    <div className="space-y-1 p-3 border-l-2 border-primary/50 hover:bg-gray-50 transition-colors">
        {Object.entries(item).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;

            return (
                <p key={key} className="text-sm">
                    <strong className="font-semibold text-gray-700 mr-2">{formatKey(key)}:</strong>
                    <span className="text-gray-600">{value}</span>
                </p>
            );
        })}
    </div>
);


export default function ResumeAnalysisCard({ analysis }: ResumeAnalysisProps) {
    const { personal_info, experience, education, technical_skills, full_analysis_score } = analysis;
    const { overall_score, strengths, gaps_and_flags, recommendations } = full_analysis_score;

    return (
        <Card className="w-full max-w-4xl mx-auto my-6 shadow-xl">
            <CardHeader className="bg-primary/5 p-6 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-extrabold text-primary">
                        Full Resume Analysis
                    </CardTitle>
                    {/* Score Badge */}
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-700">Overall Score:</span>
                        <Badge variant="default" className={`text-xl p-3 font-bold ${overall_score >= 7 ? 'bg-green-500' : overall_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {overall_score} / 10
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Column 1: Core Analysis (Strengths, Gaps, Recs) --- */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary">Recruiter Insights</h3>

                    {/* Strengths */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg flex items-center">
                            <Badge className="bg-green-500 hover:bg-green-600 mr-2">✅</Badge> Strengths
                        </h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>

                    {/* Gaps and Flags */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg flex items-center">
                            <Badge className="bg-red-500 hover:bg-red-600 mr-2">🚩</Badge> Gaps & Flags
                        </h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {gaps_and_flags.map((g, i) => <li key={i} className="text-red-700">{g}</li>)}
                        </ul>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg flex items-center">
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 mr-2">💡</Badge> Recommendations
                        </h4>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                </div>

                {/* --- Column 2 & 3: Extracted Data (Accordion) --- */}
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold border-b pb-2 text-primary mb-4">Extracted Data</h3>
                    
                    <Accordion type="multiple" defaultValue={["personal-info"]} className="w-full space-y-4">
                        
                        {/* 1. Personal Info */}
                        <AccordionItem value="personal-info" className="border rounded-lg px-4 bg-blue-50">
                            <AccordionTrigger className="font-bold text-base hover:no-underline">Personal Information</AccordionTrigger>
                            <AccordionContent className="p-2 space-y-1">
                                {Object.entries(personal_info).map(([key, value]) => (
                                    <p key={key} className="text-sm">
                                        <strong className="font-medium mr-2">{formatKey(key)}:</strong>
                                        {value ? (
                                            key === 'linkedin' ? 
                                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> 
                                            : String(value)
                                        ) : (
                                            <span className="text-gray-400 italic">Not available</span>
                                        )}
                                    </p>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        {/* 2. Technical Skills */}
                        <AccordionItem value="skills" className="border rounded-lg px-4">
                            <AccordionTrigger className="font-bold text-base hover:no-underline">Technical Skills</AccordionTrigger>
                            <AccordionContent className="p-2 flex flex-wrap gap-2">
                                {technical_skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="bg-gray-200 text-gray-800">
                                        {skill}
                                    </Badge>
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        {/* 3. Work Experience */}
                        <AccordionItem value="experience" className="border rounded-lg px-4">
                            <AccordionTrigger className="font-bold text-base hover:no-underline">Work Experience ({experience.length})</AccordionTrigger>
                            <AccordionContent className="p-2 space-y-4">
                                {experience.map((exp, i) => <DetailItem key={i} item={exp} />)}
                            </AccordionContent>
                        </AccordionItem>

                        {/* 4. Education */}
                        <AccordionItem value="education" className="border rounded-lg px-4">
                            <AccordionTrigger className="font-bold text-base hover:no-underline">Education ({education.length})</AccordionTrigger>
                            <AccordionContent className="p-2 space-y-4">
                                {education.map((edu, i) => <DetailItem key={i} item={edu} />)}
                            </AccordionContent>
                        </AccordionItem>
                        
                    </Accordion>
                </div>
                
            </CardContent>
        </Card>
    );
}