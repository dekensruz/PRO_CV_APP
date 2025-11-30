
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

// Note: Ensure process.env.API_KEY is available in your environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateResumeFromJobDescription = async (
  jobDescription: string,
  candidateName: string,
  currentResume?: ResumeData,
  language: 'fr' | 'en' = 'fr'
): Promise<ResumeData | null> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    // Construct prompt
    const prompt = `
      You are an expert CV writer. 
      Language required: ${language === 'fr' ? 'French' : 'English'}.
      
      Job Description:
      "${jobDescription}"
      
      Candidate Name: "${candidateName || 'Candidat'}"

      ${currentResume ? `Current Profile Context (use this as a base but adapt strictly to the job description): ${JSON.stringify(currentResume)}` : 'Create a fictional but realistic high-quality candidate profile for this job using the Candidate Name provided.'}

      Task: Generate a JSON resume structure optimized for this job description.
      - Extract keywords.
      - Write a compelling summary using the candidate name.
      - Create 2-3 relevant work experiences.
      - List relevant skills.
      - Create 1-2 education entries.
      - Put the provided Candidate Name in personalInfo.fullName.
      
      IMPORTANT: Return ONLY valid JSON. No markdown formatting, no code blocks.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                address: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  field: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      // Remove Markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const data = JSON.parse(cleanText);

      // Defensive coding: Ensure arrays exist
      data.experience = Array.isArray(data.experience) ? data.experience : [];
      data.education = Array.isArray(data.education) ? data.education : [];
      data.skills = Array.isArray(data.skills) ? data.skills : [];
      data.languages = Array.isArray(data.languages) ? data.languages : [];
      
      // Ensure IDs exist
      data.experience = data.experience.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() }));
      data.education = data.education.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() }));
      
      return data as ResumeData;
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
