
export interface ResumeData {
  id?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    linkedin?: string;
    jobTitle: string;
    summary: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export type TemplateType = 'modern' | 'classic' | 'minimalist';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url?: string;
  created_at?: string;
}

export type Language = 'fr' | 'en';
