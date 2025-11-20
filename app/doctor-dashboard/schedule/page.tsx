"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DoctorSchedulePage() {
    const appointments = useQuery(api.doctors.getSchedule);

    if (appointments === undefined) {
        return <ScheduleSkeleton />;
    }

    const upcoming = appointments
        .filter(a => a.date > Date.now() && a.status !== "cancelled")
        .sort((a, b) => a.date - b.date);

    const past = appointments
        .filter(a => a.date <= Date.now() && a.status !== "cancelled")
        .sort((a, b) => b.date - a.date);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
                <p className="text-muted-foreground">
                    View and manage your upcoming appointments.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Appointments
                </h2>
                {upcoming.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((appt) => (
                            <AppointmentCard key={appt._id} appointment={appt} />
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Past Appointments
                </h2>
                {past.length === 0 ? (
                    <p className="text-muted-foreground">No past appointments found.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {past.map((appt) => (
                            <AppointmentCard key={appt._id} appointment={appt} isPast />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AppointmentCard({ appointment, isPast }: { appointment: any, isPast?: boolean }) {
    const confirmAppointment = useMutation(api.doctors.confirmAppointment);
    const cancelAppointment = useMutation(api.doctors.cancelAppointment);
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await confirmAppointment({ appointmentId: appointment._id });
        } catch (error) {
            console.error("Failed to confirm appointment:", error);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await cancelAppointment({ appointmentId: appointment._id });
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleChat = () => {
        router.push(`/doctor-dashboard/messages?patientId=${appointment.patientId}`);
    };

    return (
        <Card className={cn("transition-all hover:shadow-md", isPast && "opacity-75 bg-muted/20")}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base">
                            {format(new Date(appointment.date), "EEEE, MMM d")}
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(appointment.date), "h:mm a")}
                        </CardDescription>
                    </div>
                    <Badge variant={
                        appointment.status === "confirmed" ? "default" :
                            appointment.status === "completed" ? "secondary" :
                                appointment.status === "pending" ? "outline" : "destructive"
                    }>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.patient?.name || "Unknown Patient"}</span>
                </div>
                <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">{appointment.reason}</span>
                </div>
                {!isPast && (
                    <div className="pt-2 flex gap-2 flex-wrap">
                        {appointment.status === "pending" && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="flex-1"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {isConfirming ? "Confirming..." : "Confirm"}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleChat}
                            className="flex-1"
                        >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                        </Button>
                        {(appointment.status === "pending" || appointment.status === "confirmed") && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1"
                            >
                                <XCircle className="h-3 w-3 mr-1" />
                                {isCancelling ? "Cancelling..." : "Cancel"}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ScheduleSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[180px]" />
                ))}
            </div>
        </div>
    );
}
