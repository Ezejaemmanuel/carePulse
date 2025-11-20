"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    MessageSquare,
    User,
    Activity
} from "lucide-react";

const patientLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { label: "Medical Records", href: "/dashboard/records", icon: FileText },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Vitals", href: "/dashboard/vitals", icon: Activity },
];

export default function PatientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout links={patientLinks}>
            {children}
        </DashboardLayout>
    );
}
