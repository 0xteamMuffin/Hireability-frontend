"use server";

import { GoogleGenAI } from "@google/genai";

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateResumeReview(resumeData: any, targets: any[]) {
  try {
    // Format the targets into a readable string for the AI
    const targetsList =
      targets.length > 0
        ? targets
            .map((t) => `- Role: ${t.role} at Company: ${t.companyName}`)
            .join("\n")
        : "General Full Stack Developer roles at top tech companies.";

    const prompt = `
      You are an expert HR and recruitment analyst. Your task is to meticulously evaluate a candidate's resume against their specific career aspirations (Target Companies & Roles) and provide a structured assessment.

      ---

      **CRITICAL INSTRUCTIONS FOR RESPONSE FORMAT AND CONTENT (STRICT MODE):**

      1. **STRICTLY ADHERE TO THIS MARKDOWN FORMAT. NO DEVIATIONS ARE ALLOWED.**
      2. **DO NOT ADD ANY INTRODUCTORY OR CONCLUDING SENTENCES. STICK TO ONLY THE REQUESTED STRUCTURE.**
      3. **DO NOT OUTPUT ANYTHING OUTSIDE THE SPECIFIED HEADERS BELOW. NO EXTRA COMMENTS.**
      4. **ADD "\\n" FOR EVERY LINE BREAK TO ENSURE MARKDOWN IS FORMATTED CORRECTLY IN REACT.**
      5. **NEVER USE HTML TAGS, CSS, CODE BLOCKS, OR MARKDOWN CODE FENCES.**
      6. **NEVER USE NESTED BULLETS MORE THAN TWO LEVELS.**
      7. **DO NOT USE MARKDOWN STYLES OTHER THAN WHAT IS SHOWN.**
      8. **ONLY USE "-" FOR BULLET POINTS. NEVER USE "*", "+", OR OTHER SYMBOLS.**
      9. **KEEP EVERY LINE BELOW 80 CHARACTERS.**
      10. **BOLD ALL CATEGORY TITLES EXACTLY AS SHOWN (e.g., **Category 1**).**
      11. **USE ONLY EMOJIS EXACTLY AS SPECIFIED BELOW. NO OTHER EMOJIS ALLOWED.**
      12. **THE MODEL MUST NOT HALLUCINATE STRUCTURE. FOLLOW THE HEADINGS AND SUBHEADINGS EXACTLY.**

      ---

      ## 🎯 [Candidate Name/Resume] Assessment

      ### 🟢 Strengths (Fit)
      - **Relevance to Targets:** \n
        - Evaluate how skills match: \n ${targetsList} \n
      - **Technical Stack:** \n
        - Specific evidence from resume \n
      - **Project Depth:** \n
        - Complexity analysis \n

      ### 🔴 Concerns (Gaps)
      - **Missing Requirements:** \n
        - Gaps for the specific target roles listed above \n
      - **Experience Gap:** \n
        - Comparison to industry standard for these roles \n

      ### 📊 Overall Verdict
      [Fit/Partial Fit/Not Fit] for target roles because: \n
      1. Key reason 1 \n
      2. Key reason 2 \n

      ### 💡 Recommendations
      **For Hiring Manager:** \n
      - Suggested interview questions \n
      - Areas to verify \n

      **For Candidate:** \n
      - What to highlight \n
      - Development areas to land these specific jobs \n

      ---

      **Resume Data:** \n
      ${JSON.stringify(resumeData)} \n

      **Aspiration (Job Description Context):** \n
      ${targetsList}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using stable model to avoid 429 errors
      contents: prompt,
    });

    // Handle new SDK response format
    const text =
      typeof response.text === "function" ? response.text : response.text || "";

    return { success: true, data: text };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { success: false, error: "Failed to generate review." };
  }
}
