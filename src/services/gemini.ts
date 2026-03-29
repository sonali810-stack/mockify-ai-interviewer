import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export const DOMAINS = [
  "Software Engineering",
  "Data Science",
  "Product Management",
  "Digital Marketing",
  "UI/UX Design",
  "Finance & Accounting",
  "Sales & Business Development",
  "Human Resources",
  "Project Management",
  "Cybersecurity"
];

export async function getTopQuestions(domain: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `List the top 10 interview questions for the domain: ${domain}. 
    Provide a brief explanation of why each question is important and what a good answer looks like.
    Format the output in clear Markdown.`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
}
