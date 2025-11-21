import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { Message, Attachment, AppConfig, GroundingMetadata, Role } from "../types";
import { getSystemInstruction, DEEP_RESEARCH_MODEL, IMAGE_GEN_MODEL, MAX_THINKING_BUDGET_FLASH } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatMessagesForGemini = (
  history: Message[],
  newMessage: string,
  attachments: Attachment[]
): Content[] => {
  const contents: Content[] = history
    .filter(msg => !msg.isStreaming && !msg.isGeneratingImage)
    .map(msg => {
      const parts: Part[] = [];
      if (msg.content) {
          parts.push({ text: msg.content });
      }
      if (msg.attachments) {
          msg.attachments.forEach(att => {
              parts.push({
                  inlineData: {
                      mimeType: att.mimeType,
                      data: att.data
                  }
              });
          });
      }
      
      // If message has image generated, we should probably represent it as a model response with text
      if (msg.image) {
          parts.push({ text: `[Generated Image: ${msg.image.prompt}]` });
      }

      return {
          role: msg.role === Role.USER ? 'user' : 'model',
          parts: parts
      };
  }).filter(c => c.parts.length > 0); // Filter out empty messages

  const newParts: Part[] = [];
  if (newMessage) {
    newParts.push({ text: newMessage });
  }
  if (attachments && attachments.length > 0) {
    attachments.forEach(att => {
      newParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });
  }
  
  if (newParts.length > 0) {
    contents.push({ role: 'user', parts: newParts });
  }

  return contents;
};

export const generateImage = async (prompt: string): Promise<{ base64: string, model: string, prompt: string }> => {
  try {
    // Use the simpler generateContent for nano models as per guidelines
    // Added specific validation for the prompt to be non-empty
    if (!prompt || !prompt.trim()) {
        throw new Error("Image prompt cannot be empty.");
    }

    const response = await ai.models.generateContent({
      model: IMAGE_GEN_MODEL,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    // Robust validation to prevent crashes
    if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error("The model returned an empty response (no candidates).");
    }

    const content = response.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
         throw new Error("The model returned a candidate but no content parts.");
    }

    const parts = content.parts;

    // Iterate through all parts to find the image, as per guidelines
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return {
            base64: part.inlineData.data,
            model: IMAGE_GEN_MODEL,
            prompt
        };
      }
    }
    
    // If no image data found, check for text refusal
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
        console.warn("Model Refusal/Text Only:", textPart.text);
        throw new Error(`Model response was text-only: "${textPart.text.slice(0, 100)}..."`);
    }

    throw new Error('No valid image data found in the response.');
  } catch (error: any) {
    console.error("Error in generateImage:", error);
    // Re-throw with clear message so App.tsx can display it
    throw new Error(error.message || "Image generation failed due to an unknown error.");
  }
};

export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  attachments: Attachment[],
  config: AppConfig,
  onChunk: (text: string) => void,
  onGrounding: (metadata: GroundingMetadata) => void
): Promise<string> => {
  
  const modelToUse = config.enableResearch ? DEEP_RESEARCH_MODEL : config.model;
  
  const contents = formatMessagesForGemini(history, newMessage, attachments);
  const systemInstruction = getSystemInstruction(config.personality);

  const generationConfig: any = {
    temperature: 0.75,
    maxOutputTokens: 4096,
  };

  if (config.enableThinking) {
    if (modelToUse.includes('flash')) {
        generationConfig.thinkingConfig = { thinkingBudget: MAX_THINKING_BUDGET_FLASH };
    } else if (modelToUse.includes('pro')) {
        generationConfig.thinkingConfig = { thinkingBudget: 32768 };
    }
  }

  const tools: any[] = [];
  if (config.enableSearch || config.enableResearch) {
    tools.push({googleSearch: {}});
  }

  try {
    const stream = await ai.models.generateContentStream({
      model: modelToUse,
      contents,
      config: {
        systemInstruction: systemInstruction,
        ...generationConfig,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    let fullText = "";
    for await (const chunk of stream) {
      const textChunk = chunk.text;
      if (textChunk) {
        fullText += textChunk;
        onChunk(fullText);
      }
      
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
          const webSources = groundingMetadata.groundingChunks
              .filter(c => c.web && c.web.uri)
              .map(c => ({ uri: c.web!.uri!, title: c.web!.title || c.web!.uri! }));
          
          if (webSources.length > 0) {
              onGrounding({ webSources });
          }
      }
    }

    return fullText;

  } catch (error) {
    console.error("Error in streamChatResponse:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw error;
  }
};