"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, ChevronRight, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorDashboardPage() {
    const stats = useQuery(api.doctors.getStats);
    const schedule = useQuery(api.doctors.getSchedule);
    const doctor = useQuery(api.doctors.getCurrentDoctor);

    if (stats === undefined || schedule === undefined || doctor === undefined) {
        return <DashboardSkeleton />;
    }

    if (doctor === null) {
        return <div>Doctor record not found. Please contact support.</div>;
    }

    // Filter for today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointments = schedule.filter(appt => {
        const apptDate = new Date(appt.date);
        return apptDate >= today && apptDate < tomorrow && appt.status !== "cancelled";
    });

    const nextPatient = todaysAppointments.find(appt => appt.status === "pending" || appt.status === "confirmed");

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        Welcome back, Dr. {doctor.name.split(" ").pop()}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        You have {todaysAppointments.length} appointments scheduled for today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/doctor-dashboard/schedule">
                            View Schedule
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.patients}</div>
                        <p className="text-xs text-muted-foreground">Unique patients seen</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.appointments}</div>
                        <p className="text-xs text-muted-foreground">Total appointments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Next Patient Card */}
                <Card className="col-span-full lg:col-span-4 border-primary/20 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Next Patient
                        </CardTitle>
                        <CardDescription>Immediate upcoming consultation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextPatient ? (
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                        {nextPatient.patient?.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold">{nextPatient.patient?.name}</h3>
                                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {format(new Date(nextPatient.date), "h:mm a")}
                                            </span>
                                            <span>{nextPatient.patient?.gender}, {calculateAge(nextPatient.patient?.dob)} yrs</span>
                                        </div>
                                    </div>
                                    <Button asChild size="lg" className="shadow-glow">
                                        <Link href={`/doctor-dashboard/consultation/${nextPatient._id}`}>
                                            Start Consultation <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Reason for Visit</span>
                                        <p className="font-medium">{nextPatient.reason}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Patient ID</span>
                                        <p className="font-mono text-sm text-muted-foreground">#{nextPatient.patient?._id.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">No patients waiting</p>
                                    <p className="text-sm text-muted-foreground">You're all caught up for now.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Schedule List */}
                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                        <CardDescription>{format(today, "EEEE, MMMM d")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todaysAppointments.length > 0 ? (
                                todaysAppointments.map((appt) => (
                                    <div key={appt._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-md bg-primary/5 text-primary font-medium">
                                                <span className="text-xs uppercase">{format(new Date(appt.date), "a")}</span>
                                                <span className="text-lg font-bold">{format(new Date(appt.date), "h:mm")}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{appt.patient?.name}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{appt.reason}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/doctor-dashboard/consultation/${appt._id}`}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No appointments for today.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                            <Link href="/doctor-dashboard/schedule">View Full Schedule</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function calculateAge(dob: string | undefined) {
    if (!dob) return "--";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-full lg:col-span-4 h-[300px]" />
                <Skeleton className="col-span-full lg:col-span-3 h-[300px]" />
            </div>
        </div>
    );
}
