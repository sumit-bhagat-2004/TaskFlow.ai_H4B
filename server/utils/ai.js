// File: ../utils/ai.js

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a task based on its title and description using the Gemini AI model.
 * It returns a structured JSON object containing task summary, priority,
 * required technical skills, and technical notes.
 *
 * @param {string} title - The title of the task.
 * @param {string} description - The detailed description of the task.
 * @returns {Promise<object | null>} A promise that resolves to a parsed JSON object
 * with task analysis, or null if an error occurs.
 */
export async function analyzeAndAllocateTask(title, description) {
  const prompt = `
    You are an AI assistant that helps analyze and allocate tasks based on their title and description.
    
    Given the task title and description, provide a summary, priority level, required skills, and any technical notes.
    
    Task Title: ${title}
    Task Description: ${description}
    
    Provide the response in JSON format with the following fields:
    - summary: A brief summary of the task
    - priority: The priority level (low, medium, high)
    - technical_skills: An array of required technical skills (e.g., ["JavaScript", "Node.js", "MongoDB"])
    - notes: Any additional technical notes or implementation hints (e.g., "Consider using Mongoose transactions for atomicity.")
    
    I repeat, please provide the response in JSON format.
    `;

  console.log("--- Starting AI Analysis ---");
  console.log("Prompt being sent:", prompt);
  console.log(
    "API Key Status:",
    process.env.GEMINI_API_KEY ? "Loaded" : "NOT LOADED"
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    console.log("AI Response received (raw):", response);
    let jsonResponseText = response.text; // Use 'let' for reassignment
    console.log("AI Response received (text property, raw):", jsonResponseText);

    // --- NEW, MORE ROBUST LOGIC TO EXTRACT JSON BODY ---
    const startIndex = jsonResponseText.indexOf("{");
    const endIndex = jsonResponseText.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error(
        "ERROR: Could not find valid JSON start/end characters in AI response."
      );
      // If we can't find valid JSON boundaries, it's a parsing failure.
      return null;
    }

    // Extract the substring that contains only the JSON object
    jsonResponseText = jsonResponseText
      .substring(startIndex, endIndex + 1)
      .trim();
    // ---------------------------------------------------

    console.log(
      "AI Response received (text property, cleaned):",
      jsonResponseText
    );

    const parsedResponse = JSON.parse(jsonResponseText);
    console.log("AI Response parsed successfully:", parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error("ERROR during AI analysis:", error);
    // Log more specific details if available from the error object
    if (error.response && error.response.status) {
      console.error("HTTP Status Code:", error.response.status);
      console.error("HTTP Response Data:", error.response.data);
    }
    return null;
  } finally {
    console.log("--- Finished AI Analysis ---");
  }
}
