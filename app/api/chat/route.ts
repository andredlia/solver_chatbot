import { model, type modelID } from "@/ai/providers";
import { weatherTool, fetchStockPriceTool } from "@/ai/tools";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Define the system prompt with the specified behavior for Winston Wolfe
  const systemPrompt = `
Agisci come Winston Wolfe di Pulp Fiction: sei calmo, diretto, molto competente. Parli in modo professionale, elegante ma mai esagerato. Vai dritto al punto, risolvi problemi, non perdi tempo con chiacchiere inutili. Rappresenti Solver Digital, un'azienda svizzera che offre consulenza strategica e operativa per la digitalizzazione aziendale. Aiutate le imprese a integrare software di terze parti (anche con intelligenza artificiale) oppure a sviluppare soluzioni su misura potenziate con AI. Quando parli con un utente, il tuo compito è capire di cosa ha bisogno, guidarlo con poche domande mirate e spiegargli con chiarezza cosa potete fare per lui. Se l’utente è interessato o vuole parlare con un esperto, invitalo a scrivere un’email a: enquiry@solverdigital.ch Mantieni sempre un tono professionale e risolutivo. Parla come un consulente esperto che sa quello che fa. Niente emoji. Sii sempre chiaro, sintetico e sicuro di te.
  `;

  // Extract the messages and selected model from the request
  const { messages, selectedModel }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  try {
    // Create the initial greeting message for the assistant
    const initialGreeting: UIMessage[] = [
      {
        role: "system",
        content: systemPrompt,
        id: "system-1",
        parts: [{ type: "text", text: systemPrompt }] // Add parts for system message
      },
      {
        role: "assistant",
        content: "A user just visited the Solver Digital website and is looking for help with digital transformation. Guide them briefly and ask if they have a specific project in mind.",
        id: "assistant-1",
        parts: [{ type: "text", text: "A user just visited the Solver Digital website and is looking for help with digital transformation. Guide them briefly and ask if they have a specific project in mind." }] // Add parts for assistant message
      }
    ];

    // Merge the initial greeting with the user messages
    const allMessages = [...initialGreeting, ...messages];

    // Make the streaming request to get the assistant's response
    const result = streamText({
      model: model.languageModel(selectedModel),  // Get the appropriate model
      system: systemPrompt,  // Set the system prompt for Winston Wolfe's behavior
      messages: allMessages,  // The merged initial greeting and user messages
      tools: {
        getStockPrice: fetchStockPriceTool,  // Include your tools like stock price fetcher
      },
      temperature: 0.7,  // Set the creativity level of the response    
    });

    // Return the result as a streaming response
    return result.toDataStreamResponse({
      sendReasoning: true,  // Optionally include reasoning if needed
      getErrorMessage: (error) => {
        // Handle errors and rate-limiting gracefully
        if (error instanceof Error) {
          if (error.message.includes("Rate limit")) {
            return "Rate limit exceeded. Please try again later.";
          }
        }
        console.error(error);  // Log unexpected errors for debugging
        return "An error occurred.";
      },
    });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    return new Response("An unexpected error occurred. Please try again later.", { status: 500 });
  }
}
