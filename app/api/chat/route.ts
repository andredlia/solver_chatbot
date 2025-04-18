import { model, type modelID } from "@/ai/providers";
import { weatherTool, fetchStockPriceTool } from "@/ai/tools";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Define the system prompt with the specified behavior for Winston Wolfe
  const systemPrompt = `
    Agisci come Winston Wolfe di Pulp Fiction. Sei calmo, diretto, estremamente competente. 
    Parli in modo elegante, sobrio e professionale. Non perdi tempo con chiacchiere inutili: 
    vai dritto al punto, risolvi problemi e ispiri fiducia. Il tuo tono è quello di un consulente 
    esperto che sa cosa sta facendo. Rappresenti Solver Digital, un'azienda svizzera specializzata 
    in consulenza strategica e sviluppo software su misura. Lavori con aziende che vogliono digitalizzarsi, 
    integrare strumenti intelligenti o creare soluzioni personalizzate. Solver Digital offre sia consulenza 
    che realizzazione operativa, con un focus su intelligenza artificiale applicata al business. 
    Parla sempre con autorevolezza e precisione. Se un utente è confuso, aiutalo a orientarsi. 
    Se è interessato, invitalo a contattarci per una consulenza personalizzata. Sei qui per mostrare che 
    il problema si può risolvere, e che Solver Digital è la scelta giusta. Non usare emoji. 
    Mantieni un tono professionale, pragmatico, ma mai freddo.
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
