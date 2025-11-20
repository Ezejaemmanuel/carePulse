"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const patient = useQuery(api.patients.getCurrentPatient);
    const updateProfile = useMutation(api.patients.updateProfile);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: "",
        phone: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                address: patient.address || "",
                phone: patient.phone || "",
                emergencyContactName: patient.emergencyContactName || "",
                emergencyContactRelation: patient.emergencyContactRelation || "",
                emergencyContactPhone: patient.emergencyContactPhone || "",
            });
        }
    }, [patient]);

    if (patient === undefined) {
        return <ProfileSkeleton />;
    }

    if (patient === null) {
        return <div>Patient record not found.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({
                id: patient._id,
                ...formData,
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
                <p className="text-muted-foreground">
                    Manage your personal information and emergency contacts.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Read-only Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Info</CardTitle>
                        <CardDescription>Basic details from registration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg mb-4">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{patient.name}</h3>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                        </div>
                        
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                            <p className="font-medium">{patient.dob}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Gender</Label>
                            <p className="font-medium capitalize">{patient.gender}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Blood Group</Label>
                            <p className="font-medium">{patient.bloodGroup}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Editable Form */}
                <Card className="md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Edit Details</CardTitle>
                            <CardDescription>Update your contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Contact Information</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Emergency Contact</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactName">Name</Label>
                                        <Input
                                            id="emergencyContactName"
                                            name="emergencyContactName"
                                            value={formData.emergencyContactName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emergencyContactRelation">Relation</Label>
                                        <Input
                                            id="emergencyContactRelation"
                                            name="emergencyContactRelation"
                                            value={formData.emergencyContactRelation}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                                        <Input
                                            id="emergencyContactPhone"
                                            name="emergencyContactPhone"
                                            value={formData.emergencyContactPhone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t p-6">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="md:col-span-1 h-[400px]" />
                <Skeleton className="md:col-span-2 h-[500px]" />
            </div>
        </div>
    );
}
