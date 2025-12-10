"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize AI with your API Key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateResumeReview(resumeData: any) {
  try {
    const prompt = `
      You are an expert technical recruiter. 
      Analyze the following resume details and return a strictly formatted review.
      
      Resume Data: ${JSON.stringify(resumeData)}
      
      Requirements:
      1. Use proper Markdown formatting.
      2. Include these sections: "Strengths", "Areas for Improvement", and "Actionable Feedback".
      3. Do NOT include conversational filler (e.g., "Here is your review"). Just return the markdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // or "gemini-1.5-flash"
      contents: prompt,
    });

    // FIX: Access .text() directly on the response object
    const text = response.text || "";

    return { success: true, data: text };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { success: false, error: "Failed to generate review." };
  }
}
