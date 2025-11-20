"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

export default function DashboardNavigation() {
    const doctor = useQuery(api.doctors.getCurrentDoctor);

    if (!doctor) {
        return null;
    }

    const isDoctor = doctor.role === "doctor";
    const isAdmin = doctor.role === "admin" || doctor.role === "superadmin";

    if (!isDoctor && !isAdmin) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            {(isDoctor || isAdmin) && (
                <Button asChild size="lg" className="shadow-lg hover:scale-105 transition-transform">
                    <Link href="/doctor-dashboard">
                        <LayoutDashboard className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Doctor Dashboard</span>
                    </Link>
                </Button>
            )}

            {isAdmin && (
                <Button asChild variant="destructive" size="lg" className="shadow-lg hover:scale-105 transition-transform">
                    <Link href="/admin-dashboard">
                        <ShieldCheck className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Admin Dashboard</span>
                    </Link>
                </Button>
            )}
        </div>
    );
}
