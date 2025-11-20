import { Sidebar } from "./Sidebar";
import { LucideIcon } from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
    links: {
        label: string;
        href: string;
        icon: LucideIcon;
    }[];
    isAdmin?: boolean;
}

export function DashboardLayout({ children, links, isAdmin }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col md:flex-row">
            <Sidebar links={links} isAdmin={isAdmin} />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
