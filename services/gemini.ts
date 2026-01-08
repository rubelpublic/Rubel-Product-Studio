import { GoogleGenAI, Type, Schema, Part } from "@google/genai";

// Initialize the SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const TEXT_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

// Types
export interface MarketingData {
  productName?: string;
  longDescription?: string;
  keywords?: string;
  visualHook?: string;
}

export interface CreativeOptions {
  prompt: string;
  productImages: string[]; // Base64 strings
  logoImage?: string; // Base64 string
  faceImage?: string; // Base64 string
  aspectRatio?: string; // e.g. "1:1", "3:4", "16:9"
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates marketing insights (name, description, hooks) from a product image.
 */
export const generateMarketingData = async (
  base64Image: string,
  extraContext: string = ""
): Promise<MarketingData | null> => {
  
  const [mimeType, base64Data] = base64Image.split(';base64,');
  const cleanMime = mimeType.replace('data:', '');

  const promptText = `
    Perform a Deep Vision Analysis of this product. 
    Analyze materials, vibe, color theory, and target audience. 
    ${extraContext}
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      longDescription: { 
        type: Type.STRING, 
        description: "A highly persuasive, long-form sales description (100-150 words). Use 2-3 paragraphs. Focus on emotional hooks, key features, and lifestyle benefits." 
      },
      keywords: { 
        type: Type.STRING, 
        description: "10 comma-separated SEO tags" 
      },
      visualHook: { 
        type: Type.STRING, 
        description: "A short, punchy, 3-5 word headline suitable for overlaying ON the image" 
      }
    },
    propertyOrdering: ["productName", "longDescription", "keywords", "visualHook"]
  };

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { text: promptText },
          { inlineData: { mimeType: cleanMime, data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as MarketingData;

  } catch (error) {
    console.error("Marketing Data Error:", error);
    throw error;
  }
};

/**
 * Generates the final creative advertisement image.
 */
export const generateCreative = async (options: CreativeOptions): Promise<string | null> => {
  const { prompt, productImages, logoImage, faceImage, aspectRatio } = options;

  const parts: Part[] = [{ text: prompt }];

  // Add product images
  productImages.forEach(img => {
    const [mime, data] = img.split(';base64,');
    parts.push({
      inlineData: { mimeType: mime.replace('data:', ''), data }
    });
  });

  // Add optional logo
  if (logoImage) {
    const [mime, data] = logoImage.split(';base64,');
    parts.push({
      inlineData: { mimeType: mime.replace('data:', ''), data }
    });
  }

  // Add optional face reference
  if (faceImage) {
    const [mime, data] = faceImage.split(';base64,');
    parts.push({
      inlineData: { mimeType: mime.replace('data:', ''), data }
    });
  }

  // Retry logic wrapper
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts },
        config: aspectRatio ? { imageConfig: { aspectRatio } } : undefined
      });

      const candidate = response.candidates?.[0];
      
      if (candidate) {
        // 1. Attempt to find the image part
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              }
            }
        }
        
        // 2. If no image, check if the model returned text (refusal or error explanation)
        let failureText = "";
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.text) failureText += part.text;
            }
        }
        
        if (failureText) {
            // Throw the model's text response as the error so the user sees "I cannot generate..."
            throw new Error(`Model Response: ${failureText}`);
        }
        
        // 3. Check finish reason if blocked
        if (candidate.finishReason && candidate.finishReason !== "STOP") {
             throw new Error(`Generation blocked. Reason: ${candidate.finishReason}`);
        }
      }
      
      throw new Error("No image data or text response found.");

    } catch (error) {
      console.error(`Creative Generation Attempt ${i + 1} Failed:`, error);
      lastError = error;
      // Don't retry if the model explicitly refused (returned text) or blocked for safety
      const errorMessage = String(error);
      if (errorMessage.includes("Model Response") || errorMessage.includes("Generation blocked")) {
          throw error; 
      }
      
      if (i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
  }

  throw lastError;
};