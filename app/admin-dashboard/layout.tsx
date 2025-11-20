"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Users, UserCog, Calendar, Settings } from "lucide-react";

const adminLinks = [
    { label: "Overview", href: "/admin-dashboard", icon: LayoutDashboard },
    { label: "Doctors", href: "/admin-dashboard/doctors", icon: UserCog },
    { label: "Patients", href: "/admin-dashboard/patients", icon: Users },
    { label: "Appointments", href: "/admin-dashboard/appointments", icon: Calendar },
    { label: "Settings", href: "/admin-dashboard/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout links={adminLinks} isAdmin>
            {children}
        </DashboardLayout>
    );
}
