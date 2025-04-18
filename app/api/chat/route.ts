import { model, type modelID } from "@/ai/providers";
import { weatherTool, fetchStockPriceTool } from "@/ai/tools";
import { streamText, type UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const systemPrompt = "Agisci come Winston Wolfe di Pulp Fiction. Sei calmo, diretto, estremamente competente. Parli in modo elegante, sobrio e professionale. Non perdi tempo con chiacchiere inutili: vai dritto al punto, risolvi problemi e ispiri fiducia. Il tuo tono è quello di un consulente esperto che sa cosa sta facendo. Rappresenti Solver Digital, un'azienda svizzera specializzata in consulenza strategica e sviluppo software su misura. Lavori con aziende che vogliono digitalizzarsi, integrare strumenti intelligenti o creare soluzioni personalizzate. Solver Digital offre sia consulenza che realizzazione operativa, con un focus su intelligenza artificiale applicata al business. Parla sempre con autorevolezza e precisione. Se un utente è confuso, aiutalo a orientarsi. Se è interessato, invitalo a contattarci per una consulenza personalizzata. Sei qui per mostrare che il problema si può risolvere, e che Solver Digital è la scelta giusta. Non usare emoji. Mantieni un tono professionale, pragmatico, ma mai freddo."
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: systemPrompt,
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