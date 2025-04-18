"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Header } from "./header";
import { toast } from "sonner";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({
      maxSteps: 5,
      body: {
        selectedModel,
      },
      onError: (error) => {
        toast.error(
          error.message.length > 0
            ? error.message
            : "An error occurred, please try again later.",
          { position: "top-center", richColors: true }
        );
      },
    });

  const isLoading = status === "streaming" || status === "submitted";
  const messagesEndRef = useRef<HTMLDivElement>(null); // Reference to the bottom of the messages container
  const inputRef = useRef<HTMLTextAreaElement>(null); // Ref for the textarea

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, input]);

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header />
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <div ref={messagesEndRef} /> {/* Reference point for scrolling */}
      <form
  onSubmit={handleSubmit}
  className="w-full bg-white dark:bg-black sm:px-0 sm:pb-8 max-w-xl mx-auto mobile-bottom"
>

        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
          inputRef={inputRef} // Pass the ref here
        />
      </form>
    </div>
  );
}
