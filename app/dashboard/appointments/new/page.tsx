"use client";

import { AppointmentWizard } from "@/components/dashboard/AppointmentWizard";

export default function NewAppointmentPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
                <p className="text-muted-foreground">
                    Schedule a consultation with one of our specialists.
                </p>
            </div>
            <AppointmentWizard />
        </div>
    );
}
