"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, MessageSquare, Plus, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDashboardPage() {
    const patient = useQuery(api.patients.getCurrentPatient);
    const appointments = useQuery(api.patients.getAppointments);

    // Loading state
    if (patient === undefined || appointments === undefined) {
        return <DashboardSkeleton />;
    }

    // If no patient record found (shouldn't happen if middleware/layout checks are good, but safe to handle)
    if (patient === null) {
        return <div>Patient record not found. Please contact support.</div>;
    }

    // Filter for upcoming appointments
    const upcomingAppointments = appointments
        .filter(appt => appt.date > Date.now() && appt.status !== "cancelled")
        .sort((a, b) => a.date - b.date);

    const nextAppointment = upcomingAppointments[0];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Good Morning, {patient.name.split(" ")[0]}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your health today.
                    </p>
                </div>
                <Button asChild className="shadow-glow transition-all hover:scale-105">
                    <Link href="/dashboard/appointments/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Book Appointment
                    </Link>
                </Button>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Next Appointment Card */}
                <Card className="col-span-full lg:col-span-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Next Appointment
                        </CardTitle>
                        <CardDescription>Your upcoming scheduled visit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-muted/30 p-4 rounded-lg border">
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold text-lg text-primary">
                                        {format(new Date(nextAppointment.date), "EEEE, MMMM d, yyyy")}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {format(new Date(nextAppointment.date), "h:mm a")}
                                    </p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm text-muted-foreground">Doctor</p>
                                    <p className="font-medium">{nextAppointment.doctor?.name || "Unknown Doctor"}</p>
                                    <p className="text-sm text-muted-foreground">{nextAppointment.doctor?.specialty || "Specialist"}</p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm text-muted-foreground">Reason</p>
                                    <p className="font-medium">{nextAppointment.reason}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">No upcoming appointments</p>
                                    <p className="text-sm text-muted-foreground">Schedule a check-up to stay on top of your health.</p>
                                </div>
                                <Button variant="outline" asChild className="mt-2">
                                    <Link href="/dashboard/appointments/new">Book Now</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {nextAppointment && (
                        <CardFooter className="bg-muted/10 border-t px-6 py-3">
                            <Button variant="ghost" className="w-full justify-between hover:bg-transparent hover:text-primary p-0 h-auto" asChild>
                                <Link href="/dashboard/appointments">
                                    View all appointments <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Quick Actions / Stats */}
                <div className="space-y-6">
                    <Link href="/dashboard/records" className="block">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">View History</div>
                                <p className="text-xs text-muted-foreground">Access your past diagnoses and prescriptions</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/messages" className="block">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Contact Doctor</div>
                                <p className="text-xs text-muted-foreground">Ask questions or request follow-ups</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="col-span-full lg:col-span-2 h-[250px]" />
                <div className="space-y-6">
                    <Skeleton className="h-[120px]" />
                    <Skeleton className="h-[120px]" />
                </div>
            </div>
        </div>
    );
}
