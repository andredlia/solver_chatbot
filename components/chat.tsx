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
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({
      maxSteps: 5,
      body: { selectedModel },
      onError: (error) => {
        toast.error(
          error.message.length > 0
            ? error.message
            : "An error occurred, please try again later.",
          { position: "top-center", richColors: true },
        );
      },
    });

  const isLoading = status === "streaming" || status === "submitted";
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Handle mobile keyboard appearance
  useEffect(() => {
    const viewport = window.visualViewport;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!viewport || !isMobile) return;

      const offset = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardOffset(offset > 0 ? offset : 0);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    };

    viewport?.addEventListener("resize", handleResize);
    return () => viewport?.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex flex-col justify-center w-full stretch"
      style={{ height: "100dvh", paddingBottom: keyboardOffset }}
    >
      <Header />
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}

      {/* dummy element to scroll into view when keyboard opens */}
      <div ref={bottomRef} />

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
