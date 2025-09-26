// Define the complex structure returned by your Hono backend

export interface PersonalInfo {
    name: string;
    email: string | null;
    phone: string | null;
    linkedin: string | null | undefined;
}

export interface ExperienceItem {
    title: string;
    company: string;
    dates: string;
    summary_of_impact: string;
}

export interface EducationItem {
    degree: string;
    institution: string;
    year_completed: number | null | undefined;
}

export interface FullAnalysisScore {
    overall_score: number;
    gaps_and_flags: string[];
    strengths: string[];
    recommendations: string[];
}

export interface ResumeAnalysis {
    personal_info: PersonalInfo;
    experience: ExperienceItem[];
    education: EducationItem[];
    technical_skills: string[];
    full_analysis_score: FullAnalysisScore;
}