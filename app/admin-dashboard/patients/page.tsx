"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PatientCard } from "@/components/dashboard/PatientCard";

export default function PatientsPage() {
    const patients = useQuery(api.admin.getAllPatients);

    if (!patients) {
        return <div className="p-8">Loading patients...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Manage Patients</h1>
            </div>
            {patients.length === 0 ? (
                <p className="text-muted-foreground">No patients found.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {patients.map((patient) => (
                        <PatientCard key={patient._id} patient={patient} />
                    ))}
                </div>
            )}
        </div>
    );
}
