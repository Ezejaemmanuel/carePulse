"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, MessageSquare, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useSearchParams, useRouter } from "next/navigation";

export default function DoctorMessagesPage() {
    return (
        <Suspense fallback={<MessagesLoadingFallback />}>
            <DoctorMessagesContent />
        </Suspense>
    );
}

function MessagesLoadingFallback() {
    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-background shadow-sm overflow-hidden">
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Loading messages...</p>
                </div>
            </div>
        </div>
    );
}

function DoctorMessagesContent() {
    const conversations = useQuery(api.messages.getDoctorConversations);
    const searchParams = useSearchParams();
    const router = useRouter();
    const patientIdParam = searchParams.get("patientId");
    // Use search params directly as source of truth - no separate state needed
    const selectedPatientId = patientIdParam as Id<"patients"> | null;

    // Function to handle patient selection and update URL
    const handleSelectPatient = (patientId: Id<"patients">) => {
        router.push(`/doctor-dashboard/messages?patientId=${patientId}`);
    };

    // Function to go back to conversation list (mobile)
    const handleBack = () => {
        router.push('/doctor-dashboard/messages');
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-background shadow-sm overflow-hidden relative">
            {/* Sidebar: Conversation List */}
            <div className={cn(
                "w-full md:w-80 border-r flex flex-col bg-muted/10",
                // Hide on mobile when chat is open
                selectedPatientId && "hidden md:flex"
            )}>
                <div className="p-4 border-b">
                    <h2 className="font-semibold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search patients..." className="pl-8" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {conversations?.map((conv) => (
                            <button
                                key={conv.patientId}
                                onClick={() => handleSelectPatient(conv.patientId)}
                                className={cn(
                                    "flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-transparent",
                                    selectedPatientId === conv.patientId && "bg-primary/5 border-l-4 border-l-primary"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {conv.patientName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-medium truncate">{conv.patientName}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {format(new Date(conv.lastMessage.createdAt), "MMM d")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                        {conv.lastMessage.role === "doctor" && "You: "}
                                        {conv.lastMessage.body}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                        {conversations?.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No messages yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Area: Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col bg-background",
                // On mobile, take full width when open
                selectedPatientId && "absolute md:relative inset-0 md:inset-auto z-10 md:z-auto"
            )}>
                {selectedPatientId ? (
                    <ChatWindow patientId={selectedPatientId} onBack={handleBack} />

                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatWindow({ patientId, onBack }: { patientId: Id<"patients">; onBack: () => void }) {
    const messages = useQuery(api.messages.getMessages, { patientId });
    const sendMessage = useMutation(api.messages.sendMessage);
    const markAsRead = useMutation(api.messages.markMessagesAsRead);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (patientId) {
            markAsRead({ patientId }).catch((error) => {
                console.error("Failed to mark messages as read:", error);
            });
        }
    }, [patientId, markAsRead]);

    const handleSend = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage({ body: newMessage, patientId });
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }, [newMessage, patientId, sendMessage]);

    if (messages === undefined) {
        return <div className="flex-1 flex items-center justify-center">Loading...</div>;
    }

    return (
        <>
            <div className="p-4 border-b flex items-center gap-3 bg-card/50 backdrop-blur">
                {/* Back button - only visible on mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-medium text-sm">Chat History</h3>
                        <p className="text-xs text-muted-foreground">Patient ID: #{patientId.slice(-6)}</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.role === "doctor";
                        return (
                            <div
                                key={msg._id}
                                className={cn(
                                    "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                    isMe
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <div className="flex items-baseline justify-between gap-4">
                                    <span className="font-semibold text-xs opacity-90">{msg.senderName}</span>
                                </div>
                                <p>{msg.body}</p>
                                <span className={cn("text-[10px] self-end opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {format(new Date(msg.createdAt), "h:mm a")}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

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
        </>
    );
}
