"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    LayoutDashboard,
    Calendar,
    Users,
    MessageSquare,
    ClipboardList
} from "lucide-react";

const doctorLinks = [
    { label: "Overview", href: "/doctor-dashboard", icon: LayoutDashboard },
    { label: "Schedule", href: "/doctor-dashboard/schedule", icon: Calendar },
    { label: "Patients", href: "/doctor-dashboard/patients", icon: Users },
    { label: "Messages", href: "/doctor-dashboard/messages", icon: MessageSquare },
];

export default function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout links={doctorLinks} isAdmin={false}>
            {children}
        </DashboardLayout>
    );
}
