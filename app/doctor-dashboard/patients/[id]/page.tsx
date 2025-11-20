"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { User, Phone, MapPin, Calendar, Activity, FileText, AlertCircle, Pencil } from "lucide-react";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetailsPage() {
    const params = useParams();
    const patientId = params.id as Id<"patients">;
    const data = useQuery(api.doctors.getPatientDetails, { patientId });
    const updateMedicalProfile = useMutation(api.doctors.updatePatientMedicalProfile);
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [allergies, setAllergies] = useState("");
    const [conditions, setConditions] = useState("");

    // Update local state when data is loaded
    useEffect(() => {
        if (data?.patient) {
            setAllergies(data.patient.allergies || "");
            setConditions(data.patient.chronicConditions || "");
        }
    }, [data]);

    const handleUpdateProfile = async () => {
        try {
            await updateMedicalProfile({
                patientId,
                allergies,
                chronicConditions: conditions,
            });
            toast({
                title: "Success",
                description: "Medical profile updated successfully",
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update medical profile",
                variant: "destructive",
            });
        }
    };

    if (data === undefined) {
        return <PatientDetailsSkeleton />;
    }

    if (data === null) {
        return <div>Patient not found.</div>;
    }

    const { patient, records, vitals } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shrink-0">
                    {patient.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {patient.gender}, {calculateAge(patient.dob)} yrs</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> DOB: {patient.dob}</span>
                        <span className="flex items-center gap-1"><Activity className="h-4 w-4" /> Blood: {patient.bloodGroup || "--"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {patient.phone || "--"}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {patient.address || "--"}</span>
                    </div>
                </div>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Update Medical Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Medical Profile</DialogTitle>
                            <DialogDescription>
                                Update the patient's allergies and chronic conditions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="allergies">Allergies</Label>
                                <Textarea
                                    id="allergies"
                                    value={allergies}
                                    onChange={(e) => setAllergies(e.target.value)}
                                    placeholder="List any known allergies..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="conditions">Chronic Conditions</Label>
                                <Textarea
                                    id="conditions"
                                    value={conditions}
                                    onChange={(e) => setConditions(e.target.value)}
                                    placeholder="List any chronic conditions..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Critical Info */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Allergies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium">{patient.allergies || "None recorded"}</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Chronic Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium">{patient.chronicConditions || "None recorded"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="history" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                    <TabsTrigger value="vitals">Vitals</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-4">
                    {records.length > 0 ? (
                        records.map((record) => (
                            <Card key={record._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{record.diagnosis}</CardTitle>
                                            <CardDescription>{format(new Date(record.date), "PPP")}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Symptoms</h4>
                                        <p className="text-sm text-muted-foreground">{record.symptoms}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Prescription</h4>
                                        <ul className="text-sm text-muted-foreground list-disc pl-4">
                                            {Array.isArray(record.prescription) ? (
                                                record.prescription.map((p: any, i: number) => (
                                                    <li key={i}>{p.medicine} - {p.dosage} ({p.instructions})</li>
                                                ))
                                            ) : (
                                                <li>{typeof record.prescription === 'string' ? record.prescription : JSON.stringify(record.prescription)}</li>
                                            )}
                                        </ul>
                                    </div>
                                    {record.privateNotes && (
                                        <div className="bg-muted p-3 rounded-md">
                                            <h4 className="text-xs font-medium mb-1 uppercase text-muted-foreground">Private Notes</h4>
                                            <p className="text-sm">{record.privateNotes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            No medical records found.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="vitals" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <VitalsChart
                            data={vitals}
                            type="heart_rate"
                            title="Heart Rate"
                            color="hsl(var(--primary))"
                        />
                        <VitalsChart
                            data={vitals}
                            type="bp"
                            title="Blood Pressure (Systolic)"
                            color="#82ca9d"
                        />
                        <VitalsChart
                            data={vitals}
                            type="weight"
                            title="Weight"
                            color="#8884d8"
                        />
                        <VitalsChart
                            data={vitals}
                            type="glucose"
                            title="Glucose"
                            color="#ffc658"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function calculateAge(dob: string | undefined) {
    if (!dob) return "--";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function PatientDetailsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    );
}
