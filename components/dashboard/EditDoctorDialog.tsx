import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doctor } from "./DoctorCard";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface EditDoctorDialogProps {
    doctor: Doctor;
}

export function EditDoctorDialog({ doctor }: EditDoctorDialogProps) {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<"admin" | "superadmin" | "doctor">(doctor.role);
    const [specialty, setSpecialty] = useState(doctor.specialty);
    const [status, setStatus] = useState<"active" | "inactive">(doctor.status);
    const updateDoctor = useMutation(api.doctors.updateDoctor);

    const handleUpdate = async () => {
        try {
            await updateDoctor({
                doctorId: doctor._id,
                role,
                specialty,
                status,
            });
            toast.success("Doctor updated successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update doctor");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Doctor</DialogTitle>
                    <DialogDescription>
                        Update details for {doctor.name}. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={role} onValueChange={(value: any) => setRole(value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="specialty" className="text-right">
                            Specialty
                        </Label>
                        <Input
                            id="specialty"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleUpdate}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
