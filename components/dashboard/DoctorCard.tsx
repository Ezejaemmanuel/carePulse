import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, Stethoscope, Activity } from "lucide-react";

export type Doctor = {
    _id: Id<"doctors">
    name: string
    email: string
    specialty: string
    status: "active" | "inactive"
    role: "admin" | "superadmin" | "doctor"
}

interface DoctorCardProps {
    doctor: Doctor;
}

import { EditDoctorDialog } from "./EditDoctorDialog";

export function DoctorCard({ doctor }: DoctorCardProps) {
    const updateStatus = useMutation(api.admin.updateDoctorStatus);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {doctor.specialty}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                        {doctor.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{doctor.role}</Badge>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                <EditDoctorDialog doctor={doctor} />
                <Button
                    size="sm"
                    variant={doctor.status === "active" ? "destructive" : "default"}
                    onClick={() => updateStatus({ doctorId: doctor._id, status: doctor.status === "active" ? "inactive" : "active" })}
                >
                    {doctor.status === "active" ? "Deactivate" : "Activate"}
                </Button>
            </CardFooter>
        </Card>
    );
}
