"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, XCircle, RefreshCw, BookOpen, Sparkles, MessageSquare, Upload } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const welcomeMessageShownRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  function handleEndInterview() {
    sendMessage({ text: "End Interview" });
  }

  function handleChangeDomain() {
    sendMessage({ text: "Change Domain" });
  }

  function handleChangeTopic() {
    sendMessage({ text: "Change Topic" });
  }

  function handleUploadCVClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsUploadingCV(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to parse CV");
        return;
      }

      sendMessage({ 
        text: `I have uploaded my CV. Please analyze it and ask me relevant interview questions based on my background.\n\n---CV CONTENT START---\n${data.text}\n---CV CONTENT END---` 
      });
      
      toast.success(`CV uploaded successfully (${data.pages} page${data.pages > 1 ? 's' : ''})`);
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error("Failed to upload CV. Please try again.");
    } finally {
      setIsUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handlePDFExtracted(text: string, fileName: string) {
    const summarizePrompt = `I have extracted text from a PDF file named "${fileName}". Please read the following content and provide a comprehensive summary:\n\n${text}`;
    sendMessage({ text: summarizePrompt });
    form.reset();
  }

  return (
    <div className="flex h-screen items-center justify-center font-sans">
      <main className="w-full h-screen relative">
        <div className="fixed top-0 left-0 right-0 z-50 glass-effect glass-border border-t-0 border-x-0">
          <div className="relative overflow-visible">
            <ChatHeader>
              <ChatHeaderBlock>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center glow-subtle">
                    <Sparkles className="size-4 text-white" />
                  </div>
                </div>
              </ChatHeaderBlock>
              <ChatHeaderBlock className="justify-center items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="size-10 ring-2 ring-primary/50 glow-subtle">
                      <AvatarImage src="/logo.png" />
                      <AvatarFallback className="gradient-primary text-white font-semibold">
                        PE
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold tracking-tight text-gradient">{AI_NAME}</p>
                    <p className="text-xs text-muted-foreground">MBA Interview Coach</p>
                  </div>
                </div>
              </ChatHeaderBlock>
              <ChatHeaderBlock className="justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer glass-effect glass-border hover:glow-subtle transition-all duration-300"
                  onClick={clearChat}
                >
                  <Plus className="size-4" />
                  {CLEAR_CHAT_TEXT}
                </Button>
              </ChatHeaderBlock>
            </ChatHeader>
          </div>
        </div>

        <div className="h-screen overflow-y-auto px-5 py-4 w-full pt-[100px] pb-[200px]">
          <div className="flex flex-col items-center justify-end min-h-full">
            {isClient ? (
              <>
                <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                {status === "submitted" && (
                  <div className="flex justify-start max-w-3xl w-full py-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-effect glass-border">
                      <div className="relative">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <div className="absolute inset-0 blur-sm">
                          <Loader2 className="size-5 animate-spin text-primary opacity-50" />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center max-w-2xl w-full">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-effect glass-border">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none"></div>
          
          <div className="relative w-full px-5 pt-4 pb-2 items-center flex justify-center">
            <div className="max-w-3xl w-full">
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer glass-effect glass-border hover:glow-subtle hover:border-red-500/50 hover:text-red-400 transition-all duration-300 group"
                  onClick={handleEndInterview}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <XCircle className="size-4 group-hover:text-red-400 transition-colors" />
                  End Interview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer glass-effect glass-border hover:glow-subtle hover:border-primary/50 transition-all duration-300 group"
                  onClick={handleChangeDomain}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <RefreshCw className="size-4 group-hover:text-primary transition-colors" />
                  Change Domain
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer glass-effect glass-border hover:glow-subtle hover:border-accent/50 transition-all duration-300 group"
                  onClick={handleChangeTopic}
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <BookOpen className="size-4 group-hover:text-accent transition-colors" />
                  Change Topic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer glass-effect glass-border hover:glow-subtle hover:border-green-500/50 hover:text-green-400 transition-all duration-300 group"
                  onClick={handleUploadCVClick}
                  disabled={status === "streaming" || status === "submitted" || isUploadingCV}
                >
                  {isUploadingCV ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4 group-hover:text-green-400 transition-colors" />
                  )}
                  {isUploadingCV ? "Uploading..." : "Upload CV"}
                </Button>
              </div>
            </div>
          </div>

          <div className="relative w-full px-5 pt-0 pb-2 items-center flex justify-center">
            <div className="max-w-3xl w-full">
              <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="chat-form-message" className="sr-only">
                          Message
                        </FieldLabel>
                        <div className="relative">
                          <div className="absolute inset-0 rounded-2xl glow-subtle opacity-50"></div>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 text-muted-foreground">
                              <MessageSquare className="size-5" />
                            </div>
                            <Input
                              {...field}
                              id="chat-form-message"
                              className="h-14 pr-14 pl-12 glass-effect glass-border rounded-2xl text-base placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                              placeholder="Type your message here..."
                              disabled={status === "streaming"}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  form.handleSubmit(onSubmit)();
                                }
                              }}
                            />
                            {(status == "ready" || status == "error") && (
                              <Button
                                className="absolute right-2 rounded-xl gradient-primary hover:opacity-90 transition-all duration-300 glow-subtle"
                                type="submit"
                                disabled={!field.value.trim()}
                                size="icon"
                              >
                                <ArrowUp className="size-5 text-white" />
                              </Button>
                            )}
                            {(status == "streaming" || status == "submitted") && (
                              <Button
                                className="absolute right-2 rounded-xl bg-red-500/80 hover:bg-red-500 transition-all duration-300"
                                size="icon"
                                onClick={() => {
                                  stop();
                                }}
                              >
                                <Square className="size-4 text-white" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>

          <div className="relative w-full px-5 py-3 items-center flex justify-center">
            <div className="text-xs text-muted-foreground/70 flex items-center gap-1 flex-wrap justify-center">
              <span>&copy; {new Date().getFullYear()} {OWNER_NAME}</span>
              <span className="text-muted-foreground/40">|</span>
              <Link href="/terms" className="hover:text-primary transition-colors underline-offset-4 hover:underline">Terms of Use</Link>
              <span className="text-muted-foreground/40">|</span>
              <span>Powered by</span>
              <Link href="https://ringel.ai/" className="hover:text-primary transition-colors underline-offset-4 hover:underline">Ringel.AI</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
