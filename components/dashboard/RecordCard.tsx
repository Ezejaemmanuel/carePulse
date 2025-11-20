"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface RecordCardProps {
    record: any; // Typed as any for now, ideally should be from Convex schema
}

export function RecordCard({ record }: RecordCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {record.diagnosis}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(record.date), "MMMM d, yyyy")}
                        </CardDescription>
                    </div>
                    <Badge variant="outline">{record.doctor?.specialty || "General"}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dr. {record.doctor?.name}
                </div>

                <div className="bg-muted/30 p-3 rounded-md text-sm">
                    <p className="font-medium mb-1 text-xs uppercase tracking-wider text-muted-foreground">Prescription</p>
                    <p className="line-clamp-2">{record.prescription}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Medical Record Details</DialogTitle>
                            <DialogDescription>
                                Consultation on {format(new Date(record.date), "MMMM d, yyyy")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Doctor</h4>
                                    <p className="font-medium">{record.doctor?.name}</p>
                                    <p className="text-sm text-muted-foreground">{record.doctor?.specialty}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</h4>
                                    <p className="font-medium">{record.diagnosis}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Prescription / Treatment Plan</h4>
                                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                                    {record.prescription}
                                </div>
                            </div>

                            {record.notes && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Doctor's Notes</h4>
                                    <p className="text-sm">{record.notes}</p>
                                </div>
                            )}

                            {record.attachments && record.attachments.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {record.attachments.map((url: string, idx: number) => (
                                            <Button key={idx} variant="secondary" size="sm" asChild>
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-3 w-3" />
                                                    Attachment {idx + 1}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}
