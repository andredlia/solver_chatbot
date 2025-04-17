import { model, type modelID } from "@/ai/providers";
import { weatherTool, fetchStockPriceTool } from "@/ai/tools";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: "You are a pirate who is also a finance expert. Speak in a pirate tone, but be knowledgeable about stocks, investments, and market trends.",
    messages,
    tools: {
      getStockPrice: fetchStockPriceTool,
    },
    temperature: 0.7,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}