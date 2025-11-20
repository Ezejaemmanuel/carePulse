"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Stethoscope } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MessagesPage() {
    const messages = useQuery(api.messages.getMessages, {});
    const sendMessage = useMutation(api.messages.sendMessage);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage({ body: newMessage });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">
                    Chat with your care team.
                </p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-primary/10 shadow-md">
                <CardHeader className="border-b bg-muted/20 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        Medical Team Support
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4 flex flex-col">
                            {messages === undefined ? (
                                <div className="text-center py-10 text-muted-foreground">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Send className="h-6 w-6 text-primary" />
                                    </div>
                                    <p>No messages yet.</p>
                                    <p className="text-sm">Start a conversation with your doctors.</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={cn(
                                            "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                                            msg.role === "patient"
                                                ? "ml-auto bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 text-xs opacity-70 mb-0.5">
                                            {msg.role !== "patient" && (
                                                <span className="font-semibold">{msg.senderName}</span>
                                            )}
                                        </div>
                                        {msg.body}
                                        <span className="text-[10px] opacity-50 self-end mt-1">
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
