import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export type Appointment = {
    _id: Id<"appointments">
    date: number
    status: "pending" | "confirmed" | "completed" | "cancelled"
    reason: string
    patientId: Id<"patients">
    doctorId: Id<"doctors">
}

interface AppointmentCardProps {
    appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const updateAppointment = useMutation(api.admin.updateAppointment);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(appointment.date, "PPP")}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(appointment.date, "p")}
                        </div>
                    </div>
                    <Badge variant={appointment.status === "confirmed" ? "default" : appointment.status === "pending" ? "outline" : appointment.status === "cancelled" ? "destructive" : "secondary"}>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    <span className="font-medium text-foreground">Reason: </span>
                    {appointment.reason}
                </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {appointment.status !== "confirmed" && appointment.status !== "completed" && appointment.status !== "cancelled" && (
                    <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => updateAppointment({ appointmentId: appointment._id, updates: { status: "confirmed" } })}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                    </Button>
                )}
                {appointment.status === "confirmed" && (
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => updateAppointment({ appointmentId: appointment._id, updates: { status: "completed" } })}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Complete
                    </Button>
                )}
                {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                    <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => updateAppointment({ appointmentId: appointment._id, updates: { status: "cancelled" } })}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
