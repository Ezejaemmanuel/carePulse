import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, Phone, User, Trash2 } from "lucide-react";

export type Patient = {
    _id: Id<"patients">
    name: string
    email: string
    phone: string
    gender: string
    dob: string
}

interface PatientCardProps {
    patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
    const deletePatient = useMutation(api.admin.deletePatient);

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`} alt={patient.name} />
                    <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {patient.gender}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(patient._id)}>
                    Copy ID
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                        if (confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
                            deletePatient({ patientId: patient._id });
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
            </CardFooter>
        </Card>
    );
}
