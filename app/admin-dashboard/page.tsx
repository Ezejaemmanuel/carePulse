"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCog, Calendar, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboardPage() {
    const stats = useQuery(api.admin.getStats);
    const logs = useQuery(api.admin.getSystemLogs);

    if (!stats || !logs) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    description="Registered patients"
                />
                <StatCard
                    title="Active Doctors"
                    value={stats.activeDoctors}
                    icon={UserCog}
                    description="Currently active"
                />
                <StatCard
                    title="Appointments Today"
                    value={stats.appointmentsToday}
                    icon={Calendar}
                    description="Scheduled for today"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={Clock}
                    description="Doctor registrations"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {logs.length === 0 ? (
                                <p className="text-muted-foreground">No recent activity.</p>
                            ) : (
                                logs.map((log) => (
                                    <div key={log._id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{log.action}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {log.details}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for another widget, maybe quick actions or system health */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">All systems operational</span>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Database Status</span>
                                <span className="text-green-500">Healthy</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">API Latency</span>
                                <span>45ms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
