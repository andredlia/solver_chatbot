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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const viewport = window.visualViewport;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!viewport || !isMobile || !formRef.current) return;

      const keyboardHeight =
        window.innerHeight - viewport.height - viewport.offsetTop;

      if (keyboardHeight > 150) {
        // Keyboard is likely open
        formRef.current.style.transform = `translateY(-${keyboardHeight}px)`;
      } else {
        // Keyboard is closed
        formRef.current.style.transform = `translateY(0)`;
      }
    };

    viewport?.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      viewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <div className="h-dvh flex flex-col justify-center w-full stretch overflow-hidden">
      <Header />
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 w-full bg-white dark:bg-black px-4 sm:static sm:px-0 sm:pb-8 max-w-xl mx-auto transition-transform duration-200"
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
