"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrescriptionBuilder } from "@/components/dashboard/PrescriptionBuilder";
import { toast } from "sonner";
import { Loader2, CheckCircle, ArrowLeft, History, FileText, User } from "lucide-react";
import { format } from "date-fns";

export default function ConsultationPage() {
    const params = useParams();
    const router = useRouter();
    const appointmentId = params.apptId as Id<"appointments">;
    
    // We need to fetch appointment details first to get patientId
    // But since we don't have a direct getAppointment query exposed yet, 
    // we'll fetch the schedule and find it. Ideally, we'd have a specific query.
    const schedule = useQuery(api.doctors.getSchedule);
    const appointment = schedule?.find(a => a._id === appointmentId);
    
    const patientId = appointment?.patientId;
    const patientData = useQuery(api.doctors.getPatientDetails, patientId ? { patientId } : "skip");
    
    const createRecord = useMutation(api.doctors.createConsultationRecord);

    const [symptoms, setSymptoms] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [prescription, setPrescription] = useState<{ medicine: string; dosage: string; instructions: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (schedule === undefined || (patientId && patientData === undefined)) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!appointment) {
        return <div>Appointment not found.</div>;
    }

    const handleComplete = async () => {
        if (!symptoms || !diagnosis) {
            toast.error("Please fill in symptoms and diagnosis.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createRecord({
                patientId: appointment.patientId,
                appointmentId: appointment._id,
                symptoms,
                diagnosis,
                prescription,
                notes,
            });
            toast.success("Consultation completed successfully!");
            router.push("/doctor-dashboard");
        } catch (error) {
            toast.error("Failed to save record. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b px-6 py-3 bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            Consultation with {appointment.patient?.name}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(), "PPP p")} • {appointment.reason}
                        </p>
                    </div>
                </div>
                <Button onClick={handleComplete} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Complete Consultation
                </Button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Patient History */}
                <div className="w-1/3 border-r bg-muted/10 flex flex-col">
                    <div className="p-4 border-b bg-card">
                        <h2 className="font-semibold flex items-center gap-2">
                            <History className="h-4 w-4" /> Patient History
                        </h2>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {/* Patient Info Card */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" /> Demographics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Age:</span> {calculateAge(appointment.patient?.dob)}</p>
                                    <p><span className="text-muted-foreground">Gender:</span> {appointment.patient?.gender}</p>
                                    <p><span className="text-muted-foreground">Blood Group:</span> {appointment.patient?.bloodGroup || "--"}</p>
                                    <p><span className="text-muted-foreground">Allergies:</span> <span className="text-red-500 font-medium">{appointment.patient?.allergies || "None"}</span></p>
                                </CardContent>
                            </Card>

                            {/* Past Records */}
                            {patientData?.records && patientData.records.length > 0 ? (
                                patientData.records.map((record) => (
                                    <Card key={record._id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">{format(new Date(record.date), "PP")}</CardTitle>
                                            <CardDescription className="text-xs">{record.diagnosis}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            <p className="line-clamp-2">{record.symptoms}</p>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No past records found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Panel: Consultation Form */}
                <div className="flex-1 flex flex-col bg-background">
                    <ScrollArea className="flex-1 p-6">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-medium border-b pb-2">
                                    <FileText className="h-5 w-5" /> Clinical Notes
                                </div>
                                
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="symptoms">Symptoms & Complaints <span className="text-red-500">*</span></Label>
                                        <Textarea 
                                            id="symptoms" 
                                            placeholder="Describe the patient's symptoms..." 
                                            className="min-h-[100px]"
                                            value={symptoms}
                                            onChange={(e) => setSymptoms(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="diagnosis">Diagnosis <span className="text-red-500">*</span></Label>
                                        <Input 
                                            id="diagnosis" 
                                            placeholder="Primary diagnosis" 
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                        />
                                    </div>

                                    <PrescriptionBuilder 
                                        items={prescription} 
                                        onChange={setPrescription} 
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Private Notes (Optional)</Label>
                                        <Textarea 
                                            id="notes" 
                                            placeholder="Internal notes, not visible to patient..." 
                                            className="min-h-[80px]"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
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
