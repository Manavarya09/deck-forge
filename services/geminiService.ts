import { GoogleGenAI, Type } from '@google/genai';
import type { Presentation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const presentationSchema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The concise, impactful title for the slide (3-7 words).",
          },
          subtitle: {
            type: Type.STRING,
            description: "Optional. A short, supporting phrase for the title."
          },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 2-4 short, clear bullet points.",
          },
          layout: {
            type: Type.STRING,
            description: "Suggest a layout. Choose from: 'visual-left', 'visual-right', 'data-centric', 'title-only'. Use 'title-only' for the first and last slide.",
          },
          image_prompt: {
            type: Type.STRING,
            description: "A descriptive prompt for an AI image generator to create a relevant, high-quality, and artistic photograph or abstract visual. E.g., 'minimalist shot of a single green leaf on a white marble background'. Can be empty if layout is 'data-centric' or 'title-only'.",
          },
          infographic: {
            type: Type.STRING,
            nullable: true,
            description: "If layout is 'data-centric', choose one: 'bar chart', 'timeline', 'statistic highlight'. Otherwise, null."
          },
          data: {
            type: Type.OBJECT,
            nullable: true,
            description: "The data for the infographic. Must be provided if 'infographic' is not null.",
            properties: {
                title: { type: Type.STRING, description: "Title for the infographic."},
                labels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Labels for bar chart."},
                values: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Values for bar chart or timeline events as strings."},
                value: { type: Type.STRING, description: "Main value for a statistic highlight."},
                unit: { type: Type.STRING, description: "Unit for a statistic highlight (e.g., '%', 'M')."},
                years: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Years/time points for a timeline."}
            }
          }
        },
        required: ["title", "bullets", "layout", "image_prompt"],
      },
    }
  },
  required: ["slides"],
};

export const generatePresentation = async (topic: string): Promise<Presentation> => {
    const prompt = `
    You are a presentation design assistant for a modern AI tool called DeckForge.
    Your task is to generate a visually structured presentation outline based on the topic: "${topic}".
    The goal is to produce slides that feel like high-end Canva or Pitch templates — clean, data-backed, and balanced between text, imagery, and whitespace.

    Follow these rules strictly:
    - Create between 7 and 10 slides.
    - The first slide must be a 'title-only' layout, and the last slide should be a simple 'title-only' conclusion.
    - Each slide must have a clear title, short bullet points, and a layout.
    - For visual slides, provide a vivid, detailed text-to-image prompt for AI image generation.
    - For data slides, specify an infographic type and provide sample JSON-friendly data.
    - Keep all text concise, clear, and impactful.
    - The design aesthetic should be monochrome (black, white, gray).
    - The output must be a single valid JSON object that strictly follows the provided schema.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
        temperature: 0.7,
      }
    });
    
    const jsonString = response.text;
    const presentationData = JSON.parse(jsonString);

    if (!presentationData || !Array.isArray(presentationData.slides)) {
        throw new Error("AI returned data in an unexpected format.");
    }

    return presentationData as Presentation;

  } catch (error) {
    console.error("Error generating presentation:", error);
    throw new Error("Failed to generate presentation content from AI. The topic may be too complex or the service may be unavailable.");
  }
};
