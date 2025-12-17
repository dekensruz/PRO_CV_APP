
export interface DesignSettings {
  color: string;
  font: 'sans' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius?: 'none' | 'medium' | 'full'; // New setting
}

export interface ResumeData {
  id?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    photoUrl?: string; // Added photo URL
    website?: string;
    linkedin?: string;
    jobTitle: string;
    summary: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
  design?: DesignSettings; // New design property
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
  description?: string;
}

export interface CoverLetterData {
  id?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  recipientInfo: {
    managerName: string;
    company: string;
    address: string;
  };
  content: {
    subject: string;
    opening: string;
    body: string[]; // Array of paragraphs
    closing: string;
  };
  signature: {
    type: 'text' | 'image' | 'draw';
    text: string;
    imageUrl: string;
  };
  design?: DesignSettings; // New design property
}

export type TemplateType = 'modern' | 'classic' | 'minimalist' | 'executive' | 'creative' | 'tech' | 'compact' | 'timeline' | 'leftborder' | 'glitch' | 'swiss' | 'double' | 'neo' | 'bold' | 'symmetry' | 'elegant';

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