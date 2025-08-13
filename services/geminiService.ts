
import { GoogleGenAI } from '@google/genai';
import { ProcessedDocument, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModel = () => {
  return 'gemini-2.5-flash';
};

export const getSummary = async (doc: ProcessedDocument): Promise<string> => {
  const model = getModel();
  const prompt = `You are an expert summarizer. Provide a concise, easy-to-read summary of the following document. The summary should capture the key points and main ideas. Format the output in markdown with headings and bullet points for clarity. Document content is provided below:\n\n---\n\n`;

  try {
    if (doc.type === 'pdf') {
      const response = await ai.models.generateContent({
        model,
        contents: prompt + doc.content,
      });
      return response.text;
    } else { // image
      const imagePart = {
        inlineData: {
          mimeType: `image/${doc.fileName.split('.').pop()}`,
          data: doc.content,
        },
      };
      const textPart = { text: "Provide a concise, easy-to-read summary of this document image. Capture the key information, such as invoice details, chart data, or main topics. Format it clearly using markdown." };
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] }
      });

      return response.text;
    }
  } catch (e) {
    console.error("Error generating summary:", e);
    throw new Error("Failed to generate summary from Gemini API.");
  }
};

export const askQuestion = async (
  doc: ProcessedDocument,
  question: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  const model = getModel();
  const prompt = `You are a helpful assistant specialized in answering questions based *only* on the provided document context. Your task is to carefully analyze the document content and provide accurate answers.

**Instructions:**
1.  Base your answer strictly on the document text or image provided.
2.  If the answer is not found in the document, you MUST state: "I could not find an answer to that question in the provided document."
3.  Do not use any external knowledge.
4.  Quote relevant parts of the document if it helps to support your answer.
5.  Consider the entire chat history for context, but the document is your single source of truth for answers.

**Document Context:**
---
${doc.type === 'pdf' ? doc.content : 'The context is in the provided image.'}
---

**Chat History:**
${chatHistory.map(m => `${m.role}: ${m.text}`).join('\n')}

**User's New Question:**
${question}
`;

  try {
    if (doc.type === 'pdf') {
       const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } else { // image
       const imagePart = {
        inlineData: {
          mimeType: `image/${doc.fileName.split('.').pop()}`,
          data: doc.content,
        },
      };
      const textPart = { text: prompt };
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] }
      });
      return response.text;
    }
  } catch (e) {
    console.error("Error asking question:", e);
    throw new Error("Failed to get answer from Gemini API.");
  }
};
