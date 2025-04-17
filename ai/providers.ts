import { xai } from "@ai-sdk/xai";
import { customProvider } from "ai";
import { openai } from "@ai-sdk/openai"


const languageModels = {
  "Grok": xai("grok-2-1212"),
  "Openai" : openai("gpt-4o-mini-2024-07-18"),
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "Openai";
