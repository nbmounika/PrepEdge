import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";
import { Bot } from "lucide-react";

export function AssistantMessage({ message, status, isLastMessage, durations, onDurationChange }: { message: UIMessage; status?: string; isLastMessage?: boolean; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    return (
        <div className="w-full">
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center glow-subtle">
                        <Bot className="size-4 text-white" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm flex flex-col gap-4 glass-effect glass-border rounded-2xl rounded-tl-md px-4 py-3">
                        {message.parts.map((part, i) => {
                            const isStreaming = status === "streaming" && isLastMessage && i === message.parts.length - 1;
                            const durationKey = `${message.id}-${i}`;
                            const duration = durations?.[durationKey];

                            if (part.type === "text") {
                                return <Response key={`${message.id}-${i}`}>{part.text}</Response>;
                            } else if (part.type === "reasoning") {
                                return (
                                    <ReasoningPart
                                        key={`${message.id}-${i}`}
                                        part={part}
                                        isStreaming={isStreaming}
                                        duration={duration}
                                        onDurationChange={onDurationChange ? (d) => onDurationChange(durationKey, d) : undefined}
                                    />
                                );
                            } else if (
                                part.type.startsWith("tool-") || part.type === "dynamic-tool"
                            ) {
                                if ("state" in part && part.state === "output-available") {
                                    return (
                                        <ToolResult
                                            key={`${message.id}-${i}`}
                                            part={part as unknown as ToolResultPart}
                                        />
                                    );
                                } else {
                                    return (
                                        <ToolCall
                                            key={`${message.id}-${i}`}
                                            part={part as unknown as ToolCallPart}
                                        />
                                    );
                                }
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
