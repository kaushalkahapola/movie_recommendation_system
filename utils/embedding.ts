import { GoogleGenerativeAI, EmbedContentResponse } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function embedding(prompt: string) {
  
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
    try {
      const result: EmbedContentResponse = await model.embedContent(prompt);
      const embedding = result.embedding;
  
      // Convert to number[] before returning
      const embeddingArray: number[] = embedding.values || [];
  
      return embeddingArray;
    } catch (error) {
      return ["Error generating embedding:", error];
    }
  }

export default embedding;