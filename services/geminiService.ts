import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RecommendationResponse } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    moodAnalysis: {
      type: Type.STRING,
      description: "A creative description of the mood detected from the user's input.",
    },
    movies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          year: { type: Type.STRING },
          genre: { type: Type.STRING },
          description: { type: Type.STRING },
          matchReason: { type: Type.STRING, description: "Why this movie fits the mood." },
        },
        required: ["title", "year", "genre", "description", "matchReason"],
      },
    },
  },
  required: ["moodAnalysis", "movies"],
};

export const getMovieRecommendations = async (
  text: string,
  mediaFile: File | null
): Promise<RecommendationResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-2.5-flash for speed and multimodal capabilities
    const model = "gemini-2.5-flash";

    const parts: any[] = [];

    if (mediaFile) {
      const mediaPart = await fileToGenerativePart(mediaFile);
      parts.push(mediaPart);
    }

    // Prompt engineering
    const promptText = `
      You are a sophisticated movie recommendation engine for 'Elisa Viihde'.
      Analyze the user's input (text and/or media) to determine their current mood or vibe.
      Based on this analysis, recommend 8 distinct movies that perfectly match this mood.
      Treat the input as a "mood board".
      
      User Input Text: "${text || "No text provided, strictly analyze the visual/audio content."}"
      
      Requirements:
      1. Interpret the emotional tone, color palette, or action in the media if provided.
      2. Select movies that are generally available on streaming platforms (Elisa Viihde style catalog).
      3. Provide a 'matchReason' that explicitly connects the movie to the specific details in the user's input.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    if (!response.text) {
        throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text) as RecommendationResponse;

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};