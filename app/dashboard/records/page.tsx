"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RecordCard } from "@/components/dashboard/RecordCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function MedicalRecordsPage() {
    const records = useQuery(api.patients.getMedicalRecords);

    if (records === undefined) {
        return <RecordsSkeleton />;
    }

    // Sort by date descending
    const sortedRecords = [...records].sort((a, b) => b.date - a.date);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
                <p className="text-muted-foreground">
                    View your medical history, prescriptions, and lab results.
                </p>
            </div>

            {sortedRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Records Found</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                        Your medical records will appear here after your consultations.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedRecords.map((record) => (
                        <RecordCard key={record._id} record={record} />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecordsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[250px]" />
                ))}
            </div>
        </div>
    );
}
