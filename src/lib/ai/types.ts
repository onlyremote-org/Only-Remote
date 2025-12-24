export interface ResumeIssue {
    original_text?: string; // Optional because structure issues might not map to a specific sentence
    location_hint?: string; // Used when exact text match isn't possible
    issue: string;
    improvement: string;
}

export interface SectionAnalysis {
    score: number;
    issues: ResumeIssue[];
}

export interface StructuredResume {
    professional_experience: {
        company: string;
        role: string;
        start_date: string;
        end_date: string;
        description: string;
    }[];
    education: {
        institution: string;
        degree: string;
        field: string;
        start_date: string;
        end_date: string;
    }[];
    projects: {
        name: string;
        description: string;
        technologies: string[];
    }[];
    skills: {
        category: string;
        skills: string[];
    }[];
}

export interface ResumeAnalysisResponse {
    overall_score: number;
    executive_summary: string;
    sections: {
        impact: SectionAnalysis;
        terminology: SectionAnalysis;
        structure: SectionAnalysis;
    };
    global_recommendations: string[];
    extracted_skills: string[];
    structured_resume: StructuredResume;
}
