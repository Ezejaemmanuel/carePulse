"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";

export default function AppointmentsPage() {
    const appointments = useQuery(api.admin.getAllAppointments);

    if (!appointments) {
        return <div className="p-8">Loading appointments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Manage Appointments</h1>
            </div>
            {appointments.length === 0 ? (
                <p className="text-muted-foreground">No appointments found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((appointment) => (
                        <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                </div>
            )}
        </div>
    );
}
