"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/alert-dialog";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Calendar as CalendarIcon, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export function AppointmentWizard() {
    const router = useRouter();
    const convex = useConvex();
    const [step, setStep] = useState(1);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [reason, setReason] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
    const [conflictDetails, setConflictDetails] = useState<{
        doctorName?: string;
        appointmentTime?: number;
    }>({});

    const doctors = useQuery(api.patients.getDoctors);
    const availableSlots = useQuery(
        api.patients.getAvailableSlots,
        selectedDoctorId && selectedDate
            ? { doctorId: selectedDoctorId as any, date: selectedDate.setHours(0, 0, 0, 0) }
            : "skip"
    );
    const bookAppointment = useMutation(api.patients.bookAppointment);

    const handleDoctorSelect = (value: string) => {
        setSelectedDoctorId(value);
        setSelectedDate(undefined);
        setSelectedSlot(null);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleBook = async () => {
        if (!selectedDoctorId || !selectedDate || !selectedSlot || !reason) return;

        setIsBooking(true);
        try {
            // First, check for conflicts proactively
            const conflictCheck = await convex.query(api.patients.checkAppointmentConflict, {
                doctorId: selectedDoctorId as Id<"doctors">,
                date: selectedSlot,
            });

            if (conflictCheck.hasConflict) {
                // Show AlertDialog with conflict details
                setConflictDetails({
                    doctorName: conflictCheck.doctorName,
                    appointmentTime: conflictCheck.appointmentTime,
                });
                setConflictDialogOpen(true);
                setIsBooking(false);
                return;
            }

            // No conflict, proceed with booking
            await bookAppointment({
                doctorId: selectedDoctorId as Id<"doctors">,
                date: selectedSlot,
                reason: reason,
            });
            toast.success("Appointment booked successfully!");
            router.push("/dashboard/appointments");
        } catch (error) {
            console.error(error);
            toast.error("Failed to book appointment. Please try again.");
            setIsBooking(false);
        }
    };

    const handleSelectDifferentTime = () => {
        setConflictDialogOpen(false);
        setStep(2);
        setSelectedSlot(null);
    };

    const selectedDoctor = doctors?.find(d => d._id === selectedDoctorId);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors bg-background border-2",
                                step >= s ? "border-primary text-primary" : "border-muted text-muted-foreground",
                                step === s && "ring-4 ring-primary/20"
                            )}
                        >
                            {s}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>Doctor & Date</span>
                    <span>Time Slot</span>
                    <span>Confirm</span>
                </div>
            </div>

            <Card className="border-primary/10 shadow-lg">
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Select Doctor & Date"}
                        {step === 2 && "Select Time Slot"}
                        {step === 3 && "Confirm Appointment"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Choose a specialist and a preferred date for your visit."}
                        {step === 2 && "Pick an available time slot that works for you."}
                        {step === 3 && "Review your details and provide a reason for the visit."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    {step === 1 && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Doctor</Label>
                                    <Select onValueChange={handleDoctorSelect} value={selectedDoctorId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors?.map((doctor) => (
                                                <SelectItem key={doctor._id} value={doctor._id}>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-medium">{doctor.name}</span>
                                                        <span className="text-xs text-muted-foreground">{doctor.specialty}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedDoctor && (
                                    <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <User className="h-4 w-4 text-primary" />
                                            About Dr. {selectedDoctor.name.split(" ").pop()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Specialist in {selectedDoctor.specialty}.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center border-l pl-8">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                    className="rounded-md border shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">
                                        {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        with {selectedDoctor?.name}
                                    </p>
                                </div>
                            </div>

                            {availableSlots === undefined ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No available slots for this date. Please choose another date.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                    {availableSlots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedSlot === slot ? "default" : "outline"}
                                            className={cn(
                                                "h-auto py-3 flex flex-col gap-1",
                                                selectedSlot === slot && "ring-2 ring-primary ring-offset-2"
                                            )}
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            <Clock className="h-4 w-4 mb-1" />
                                            {format(new Date(slot), "h:mm a")}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Appointment Summary</Label>
                                        <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Doctor</span>
                                                <span className="font-medium">{selectedDoctor?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Specialty</span>
                                                <span className="font-medium">{selectedDoctor?.specialty}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Date</span>
                                                <span className="font-medium">
                                                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Time</span>
                                                <span className="font-medium">
                                                    {selectedSlot ? format(new Date(selectedSlot), "h:mm a") : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Reason for Visit</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Please describe your symptoms or reason for booking..."
                                            className="min-h-[120px]"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || isBooking}
                    >
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && (!selectedDoctorId || !selectedDate)) ||
                                (step === 2 && !selectedSlot)
                            }
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            onClick={handleBook}
                            disabled={!reason || isBooking}
                            className="min-w-[120px]"
                        >
                            {isBooking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Confirm Booking
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Conflict Alert Dialog */}
            <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Time Slot Unavailable</AlertDialogTitle>
                        <AlertDialogDescription>
                            {conflictDetails.doctorName && conflictDetails.appointmentTime ? (
                                <>
                                    This appointment slot with <strong>Dr. {conflictDetails.doctorName}</strong> at{" "}
                                    <strong>{format(new Date(conflictDetails.appointmentTime), "h:mm a")}</strong> has
                                    already been booked by another patient.
                                </>
                            ) : (
                                "This time slot is no longer available. Please select a different time."
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSelectDifferentTime}>
                            Select Different Time
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
