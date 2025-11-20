"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
    const appointments = useQuery(api.patients.getAppointments);

    if (appointments === undefined) {
        return <AppointmentsSkeleton />;
    }

    const upcoming = appointments
        .filter(a => a.date > Date.now() && a.status !== "cancelled")
        .sort((a, b) => a.date - b.date);

    const past = appointments
        .filter(a => a.date <= Date.now() && a.status !== "cancelled")
        .sort((a, b) => b.date - a.date);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                    <p className="text-muted-foreground">
                        Manage your scheduled visits and view history.
                    </p>
                </div>
                <Button asChild className="shadow-glow">
                    <Link href="/dashboard/appointments/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Appointment
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming
                </h2>
                {upcoming.length === 0 ? (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">No upcoming appointments scheduled.</p>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/appointments/new">Book Now</Link>
                            </Button>
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
                    Past Visits
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
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.doctor?.name}</span>
                </div>
                <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">{appointment.reason}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function AppointmentsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[180px]" />
                ))}
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
