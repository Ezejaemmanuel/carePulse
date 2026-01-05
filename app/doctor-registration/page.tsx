"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Stethoscope, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    gender: z.string().min(1, "Please select a gender"),
    dob: z.string().min(1, "Date of birth is required"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    licenseNumber: z.string().min(5, "License number is required"),
    medicalSchool: z.string().min(2, "Medical school is required"),
    graduationYear: z.string().min(4, "Graduation year is required"),
    primarySpecialty: z.string().min(2, "Primary specialty is required"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
});

const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Professional Info", icon: Stethoscope },
    { id: 3, title: "Review", icon: CheckCircle2 },
];

export default function DoctorRegistrationPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const registerDoctor = useMutation(api.doctor_registrations.submitRegistration);
    const checkDoctor = useQuery(api.doctors.getCurrentDoctor);
    const registrationStatus = useQuery(api.doctor_registrations.getRegistrationStatus);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(10);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            gender: "",
            dob: "",
            address: "",
            licenseNumber: "",
            medicalSchool: "",
            graduationYear: "",
            primarySpecialty: "",
            bio: "",
        },
    });

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-up");
        }
    }, [isLoaded, isSignedIn, router]);

    // Pre-fill email and name from Clerk user if available
    useEffect(() => {
        if (user) {
            if (user.fullName && !form.getValues("name")) {
                form.setValue("name", user.fullName);
            }
            if (user.primaryEmailAddress?.emailAddress && !form.getValues("email")) {
                form.setValue("email", user.primaryEmailAddress.emailAddress);
            }
        }
    }, [user, form]);


    // Redirect if already a doctor or has pending registration
    useEffect(() => {
        if (checkDoctor) {
            router.push("/doctor-dashboard");
        }
        if (registrationStatus && registrationStatus.status === "pending") {
            router.push("/doctor-dashboard");
        }
    }, [checkDoctor, registrationStatus, router]);

    if (!isLoaded || (isSignedIn && (checkDoctor === undefined || registrationStatus === undefined))) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isSignedIn) {
        return null; // Will redirect
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await registerDoctor({
                name: values.name,
                email: values.email,
                details: {
                    phone: values.phone,
                    gender: values.gender,
                    dob: values.dob,
                    address: values.address,
                    licenseNumber: values.licenseNumber,
                    medicalSchool: values.medicalSchool,
                    graduationYear: values.graduationYear,
                    primarySpecialty: values.primarySpecialty,
                    bio: values.bio,
                }
            });

            // Start verification countdown
            setIsVerifying(true);
            setIsSubmitting(false);

            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        toast.success("Registration verified successfully!");
                        router.push("/doctor-dashboard");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit registration. Please try again.");
            setIsSubmitting(false);
        }
    }

    const nextStep = async () => {
        let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];
        if (step === 1) {
            fieldsToValidate = ["name", "email", "phone", "gender", "dob", "address"];
        } else if (step === 2) {
            fieldsToValidate = ["licenseNumber", "medicalSchool", "graduationYear", "primarySpecialty", "bio"];
        }

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    const progress = (step / steps.length) * 100;

    return (
        <div className="container mx-auto py-10 flex justify-center items-center min-h-screen">
            <div className="w-full max-w-3xl space-y-8">
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={`flex flex-col items-center ${s.id <= step ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${s.id <= step
                                        ? "border-primary bg-primary/10"
                                        : "border-muted-foreground/30"
                                        }`}
                                >
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium hidden sm:block">{s.title}</span>
                            </div>
                        ))}
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card className="w-full border-none shadow-glow">
                    <CardHeader>
                        <CardTitle>Doctor Registration</CardTitle>
                        <CardDescription>
                            Step {step} of 3: {steps[step - 1].title}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {step === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Dr. John Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="john@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+1234567890" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Gender</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select gender" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="male">Male</SelectItem>
                                                                <SelectItem value="female">Female</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="dob"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date of Birth</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="123 Medical Center Dr..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="licenseNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Medical License Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="MD123456" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="primarySpecialty"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Primary Specialty</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select specialty" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="cardiology">Cardiology</SelectItem>
                                                                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                                                <SelectItem value="neurology">Neurology</SelectItem>
                                                                <SelectItem value="dermatology">Dermatology</SelectItem>
                                                                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                                                                <SelectItem value="general">General Practice</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="medicalSchool"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Medical School</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="University of Medicine" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="graduationYear"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Graduation Year</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="2015" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Professional Bio</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Tell us about your experience..." className="h-32" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="font-semibold">Personal Information</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setStep(1)}
                                                    type="button"
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-muted-foreground">Name:</span>
                                                <span>{form.getValues("name")}</span>
                                                <span className="text-muted-foreground">Email:</span>
                                                <span>{form.getValues("email")}</span>
                                                <span className="text-muted-foreground">Phone:</span>
                                                <span>{form.getValues("phone")}</span>
                                                <span className="text-muted-foreground">DOB:</span>
                                                <span>{form.getValues("dob")}</span>
                                                <span className="text-muted-foreground">Gender:</span>
                                                <span className="capitalize">{form.getValues("gender")}</span>
                                                <span className="text-muted-foreground">Address:</span>
                                                <span>{form.getValues("address")}</span>
                                            </div>
                                        </div>

                                        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <h3 className="font-semibold">Professional Information</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setStep(2)}
                                                    type="button"
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-muted-foreground">License:</span>
                                                <span>{form.getValues("licenseNumber")}</span>
                                                <span className="text-muted-foreground">Specialty:</span>
                                                <span className="capitalize">{form.getValues("primarySpecialty")}</span>
                                                <span className="text-muted-foreground">School:</span>
                                                <span>{form.getValues("medicalSchool")}</span>
                                                <span className="text-muted-foreground">Graduation:</span>
                                                <span>{form.getValues("graduationYear")}</span>
                                                <span className="text-muted-foreground">Bio:</span>
                                                <span className="truncate">{form.getValues("bio")}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isVerifying && (
                                    <CardFooter className="flex justify-between px-0 pt-4">
                                        {step > 1 && (
                                            <Button type="button" variant="outline" onClick={prevStep}>
                                                Previous
                                            </Button>
                                        )}
                                        {step < 3 ? (
                                            <Button type="button" className="ml-auto" onClick={nextStep}>
                                                Next
                                            </Button>
                                        ) : (
                                            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Submit Registration
                                            </Button>
                                        )}
                                    </CardFooter>
                                )}
                            </form>
                        </Form>

                        {isVerifying && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold">Verifying Your Registration</h3>
                                    <p className="text-muted-foreground">
                                        Please wait while we verify your medical credentials...
                                    </p>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-2xl font-bold text-primary">{countdown}</span>
                                        <span className="text-muted-foreground">seconds remaining</span>
                                    </div>
                                </div>
                                <Progress value={(10 - countdown) / 10 * 100} className="w-full max-w-xs" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
