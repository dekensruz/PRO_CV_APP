import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

// Helper to safely get the API key
const getApiKey = () => {
  // 1. Check Vite Environment Variable (Recommended for Vercel)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Check standard process.env (mapped in vite.config.ts)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
  }

  return '';
};

export const generateResumeFromJobDescription = async (
  jobDescription: string,
  candidateName: string,
  currentResume?: ResumeData,
  language: 'fr' | 'en' = 'fr'
): Promise<ResumeData | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("API Key is missing. Please check your environment variables (VITE_API_KEY or API_KEY).");
      alert("Clé API manquante. Sur Vercel, ajoutez la variable d'environnement 'VITE_API_KEY'.");
      return null;
    }

    // Initialize AI instance here, not globally, to prevent load-time crashes
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const modelId = "gemini-2.5-flash";
    
    // Check if the current resume is effectively empty (just initialized)
    const isResumeEmpty = !currentResume || (currentResume.experience.length === 0 && currentResume.education.length === 0 && !currentResume.personalInfo.summary);

    // Construct prompt
    const prompt = `
      You are an expert CV writer. 
      Language required: ${language === 'fr' ? 'French' : 'English'}.
      
      Job Description:
      "${jobDescription}"
      
      Candidate Name: "${candidateName || 'Candidat'}"

      ${!isResumeEmpty 
        ? `CONTEXT: The user has existing data: ${JSON.stringify(currentResume)}. TASK: IMPROVE and ADAPT this data to match the job description. Rewrite the summary, tweak the experience descriptions to highlight relevant keywords. KEEP the factual history (dates, companies) unless they are empty.` 
        : `CONTEXT: The user has no resume data yet. TASK: CREATE A FULLY FICTIONAL BUT REALISTIC PRE-FILLED RESUME for a candidate perfect for this job. GENERATE 3 work experiences, 2 education entries, 8 skills, and a strong summary.`
      }

      CRITICAL INSTRUCTIONS:
      1. You MUST generate at least 2-3 items in the 'experience' array.
      2. You MUST generate at least 1-2 items in the 'education' array.
      3. You MUST generate at least 6-8 relevant skills.
      4. Return ONLY valid JSON matching the schema.
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
      
      // Preserve original personal info if it was provided and AI returned partial data
      if (!isResumeEmpty && currentResume) {
          if (!data.personalInfo.email && currentResume.personalInfo.email) data.personalInfo.email = currentResume.personalInfo.email;
          if (!data.personalInfo.phone && currentResume.personalInfo.phone) data.personalInfo.phone = currentResume.personalInfo.phone;
          if (!data.personalInfo.photoUrl && currentResume.personalInfo.photoUrl) data.personalInfo.photoUrl = currentResume.personalInfo.photoUrl;
      }

      return data as ResumeData;
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};