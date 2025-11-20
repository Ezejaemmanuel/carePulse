"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Activity } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { DoctorAppointmentBadge } from "./DoctorAppointmentBadge";
import { useState, useEffect } from "react";

import { ModeToggle } from "@/components/theme-toggle";

interface SidebarProps {
    links: {
        label: string;
        href: string;
        icon: LucideIcon;
    }[];
    isAdmin?: boolean;
}

export function Sidebar({ links, isAdmin }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Only fetch if admin to avoid errors or unnecessary calls
    const pendingRegistrations = useQuery(api.doctor_registrations.getPendingRegistrations, isAdmin ? {} : "skip");
    const pendingCount = isAdmin ? (pendingRegistrations?.length || 0) : 0;

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
            {/* Header / Branding */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary transition-colors hover:text-primary/80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span>MediCare</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4">
                <div className="space-y-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Button
                                key={link.href}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start text-base font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                                asChild
                            >
                                <Link href={link.href}>
                                    <link.icon className={cn(
                                        "mr-3 h-5 w-5 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )} />
                                    {link.label}
                                    {isAdmin && link.href.includes("registrations") && pendingCount > 0 && (
                                        <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-pulse">
                                            {pendingCount}
                                        </Badge>
                                    )}
                                    {!isAdmin && link.href.includes("schedule") && (
                                        <DoctorAppointmentBadge />
                                    )}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="border-t p-4 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-lg border p-3 shadow-sm bg-card hover:bg-accent/5 transition-colors">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-10 w-10 ring-2 ring-primary/10",
                            }
                        }}
                    />
                    <div className="flex flex-col overflow-hidden mr-auto">
                        <span className="truncate text-sm font-medium leading-none">
                            {user?.fullName || user?.username || "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground mt-1">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block md:w-72 md:shrink-0 md:h-screen md:sticky md:top-0 shadow-xl shadow-primary/5 z-20">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden p-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 border-r-primary/10">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        {links.find(l => l.href === pathname)?.label || "Dashboard"}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </>
    );
}


