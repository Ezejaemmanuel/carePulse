"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { DoctorCard } from "@/components/dashboard/DoctorCard";

export default function DoctorsPage() {
    const doctors = useQuery(api.admin.getAllDoctors);
    const pendingRegistrations = useQuery(api.admin.getPendingRegistrations);
    const approveDoctor = useMutation(api.admin.approveDoctor);

    if (!doctors || !pendingRegistrations) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Doctors</TabsTrigger>
                    <TabsTrigger value="pending">
                        Pending Requests
                        {pendingRegistrations.length > 0 && (
                            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                {pendingRegistrations.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    {doctors.length === 0 ? (
                        <p className="text-muted-foreground">No doctors found.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {doctors.map((doctor) => (
                                <DoctorCard key={doctor._id} doctor={doctor} />
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingRegistrations.length === 0 ? (
                            <p className="text-muted-foreground col-span-full">No pending registrations.</p>
                        ) : (
                            pendingRegistrations.map((reg) => (
                                <div key={reg._id} className="flex flex-col justify-between p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">{reg.name}</h3>
                                        <p className="text-sm text-muted-foreground">{reg.email}</p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">Specialty:</span>
                                            {reg.details.primarySpecialty}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        // Reject logic not implemented yet
                                        >
                                            <X className="w-4 h-4 mr-1" /> Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={() => approveDoctor({ registrationId: reg._id })}
                                        >
                                            <Check className="w-4 h-4 mr-1" /> Approve
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
