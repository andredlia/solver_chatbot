"use client";

import { defaultModel, type modelID } from "@/ai/providers";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Header } from "./header";
import { toast } from "sonner";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
            : "An error occured, please try again later.",
          { position: "top-center", richColors: true },
        );
      },
    });

  const isLoading = status === "streaming" || status === "submitted";

  // Scroll to bottom on keyboard open (mobile only)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch">
      <Header />
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-w-xl w-full mx-auto">
          <Messages messages={messages} isLoading={isLoading} status={status} />
          <div ref={bottomRef} />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 w-full bg-white dark:bg-black px-4 sm:static sm:px-0 sm:pb-8 max-w-xl mx-auto"
      >
        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </form>
    </div>
  );
}
