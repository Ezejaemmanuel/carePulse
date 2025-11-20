"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientListPage() {
    const patients = useQuery(api.doctors.getPatients);
    const [searchQuery, setSearchQuery] = useState("");

    if (patients === undefined) {
        return <PatientListSkeleton />;
    }

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchQuery))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                    <p className="text-muted-foreground">
                        Manage and view your patient records.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Blood Group</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <TableRow key={patient._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    {patient.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{patient.email}</span>
                                                    <span className="text-muted-foreground text-xs">{patient.phone || "--"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{patient.gender}</TableCell>
                                            <TableCell>{patient.bloodGroup || "--"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/doctor-dashboard/patients/${patient._id}`}>
                                                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No patients found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function PatientListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-96" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
