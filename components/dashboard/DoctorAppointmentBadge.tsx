"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";

export function DoctorAppointmentBadge() {
    const stats = useQuery(api.doctors.getStats);

    if (!stats || stats.pending === 0) {
        return null;
    }

    return (
        <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-pulse">
            {stats.pending}
        </Badge>
    );
}
