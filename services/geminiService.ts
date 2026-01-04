import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, CoverLetterData } from "../types";

// Helper to safely get the API key
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
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
      alert("Clé API manquante. Veuillez configurer API_KEY.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Utilisation de Gemini 3 Pro pour des tâches de rédaction complexes
    const modelId = "gemini-3-pro-preview";
    
    const isResumeEmpty = !currentResume || (currentResume.experience.length === 0 && currentResume.education.length === 0 && !currentResume.personalInfo.summary);

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
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const data = JSON.parse(cleanText);
      data.experience = Array.isArray(data.experience) ? data.experience : [];
      data.education = Array.isArray(data.education) ? data.education : [];
      data.skills = Array.isArray(data.skills) ? data.skills : [];
      data.languages = Array.isArray(data.languages) ? data.languages : [];
      
      data.experience = data.experience.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() }));
      data.education = data.education.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID() }));
      
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

export const generateCoverLetter = async (
  jobDescription: string,
  resumeData: ResumeData,
  language: 'fr' | 'en' = 'fr'
): Promise<CoverLetterData | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const modelId = "gemini-3-pro-preview";

    const prompt = `
      You are an expert career coach.
      Language required: ${language === 'fr' ? 'French' : 'English'}.
      
      TASK: Write a professional COVER LETTER based on the candidate's resume and the job description.
      
      Job Description:
      "${jobDescription}"
      
      Candidate Info:
      Name: ${resumeData.personalInfo.fullName}
      Resume Summary: ${resumeData.personalInfo.summary}
      Resume Data (JSON): ${JSON.stringify({ experience: resumeData.experience, skills: resumeData.skills })}

      Instructions:
      1. Extract the company name from the job description if possible.
      2. Write a compelling opening, body paragraphs highlighting fit, and a professional closing.
      3. The body should have 2-3 paragraphs.
      4. Avoid generic fluff; use the specific skills and experiences provided in the resume.
      5. Return strict JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipientInfo: {
              type: Type.OBJECT,
              properties: {
                 managerName: { type: Type.STRING },
                 company: { type: Type.STRING },
                 address: { type: Type.STRING }
              }
            },
            content: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                opening: { type: Type.STRING },
                body: { type: Type.ARRAY, items: { type: Type.STRING } },
                closing: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        personalInfo: {
           fullName: resumeData.personalInfo.fullName,
           email: resumeData.personalInfo.email,
           phone: resumeData.personalInfo.phone,
           address: resumeData.personalInfo.address
        },
        recipientInfo: data.recipientInfo,
        content: data.content,
        signature: {
            type: 'text',
            text: resumeData.personalInfo.fullName,
            imageUrl: ''
        }
      } as CoverLetterData;
    }
    return null;
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);
    throw error;
  }
};