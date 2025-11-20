"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, User, FileHeart, Phone, Edit2 } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
    // Step 1: Personal Details
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    dob: z.string().refine((val) => new Date(val) < new Date(), "Date of birth must be in the past"),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
    address: z.string().min(5, "Address must be at least 5 characters"),

    // Step 2: Medical Info
    bloodGroup: z.string().min(1, "Please select a blood group"),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),

    // Step 3: Emergency Contact
    emergencyContactName: z.string().min(2, "Name must be at least 2 characters"),
    emergencyContactRelation: z.string().min(2, "Relationship is required"),
    emergencyContactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
    { id: 1, title: "Personal Details", icon: User },
    { id: 2, title: "Medical Info", icon: FileHeart },
    { id: 3, title: "Emergency Contact", icon: Phone },
    { id: 4, title: "Review & Verify", icon: CheckCircle2 },
];

export default function RegistrationForm() {
    const [step, setStep] = useState(1);
    const register = useMutation(api.patients.register);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            dob: "",
            address: "",
            bloodGroup: "",
            allergies: "",
            chronicConditions: "",
            emergencyContactName: "",
            emergencyContactRelation: "",
            emergencyContactPhone: "",
        },
        mode: "onChange",
    });

    const { trigger, getValues } = form;

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];

        if (step === 1) {
            fieldsToValidate = ["name", "email", "phone", "dob", "gender", "address"];
        } else if (step === 2) {
            fieldsToValidate = ["bloodGroup"];
        } else if (step === 3) {
            fieldsToValidate = ["emergencyContactName", "emergencyContactRelation", "emergencyContactPhone"];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await register(data);
            toast.success("Registration successful!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to register. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = (step / steps.length) * 100;

    return (
        <div className="w-full">
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

            <Card className="border-none shadow-glow">
                <CardHeader>
                    <CardTitle>{steps[step - 1].title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1 234 567 890" {...field} />
                                                    </FormControl>
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
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
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
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="123 Main St, City, Country"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="bloodGroup"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Blood Group</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select blood group" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                                                            (bg) => (
                                                                <SelectItem key={bg} value={bg}>
                                                                    {bg}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="allergies"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Allergies (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Peanuts, Penicillin, etc."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="chronicConditions"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Chronic Conditions (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Diabetes, Hypertension, etc."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="emergencyContactName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="emergencyContactRelation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Relationship</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Spouse, Parent, etc." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="emergencyContactPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1 234 567 890" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="font-semibold">Personal Details</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep(1)}
                                                type="button"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span>{getValues("name")}</span>
                                            <span className="text-muted-foreground">Email:</span>
                                            <span>{getValues("email")}</span>
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span>{getValues("phone")}</span>
                                            <span className="text-muted-foreground">DOB:</span>
                                            <span>{getValues("dob")}</span>
                                            <span className="text-muted-foreground">Gender:</span>
                                            <span className="capitalize">{getValues("gender")}</span>
                                            <span className="text-muted-foreground">Address:</span>
                                            <span>{getValues("address")}</span>
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="font-semibold">Medical Info</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep(2)}
                                                type="button"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Blood Group:</span>
                                            <span>{getValues("bloodGroup")}</span>
                                            <span className="text-muted-foreground">Allergies:</span>
                                            <span>{getValues("allergies") || "None"}</span>
                                            <span className="text-muted-foreground">Conditions:</span>
                                            <span>{getValues("chronicConditions") || "None"}</span>
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="font-semibold">Emergency Contact</h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setStep(3)}
                                                type="button"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">Name:</span>
                                            <span>{getValues("emergencyContactName")}</span>
                                            <span className="text-muted-foreground">Relation:</span>
                                            <span>{getValues("emergencyContactRelation")}</span>
                                            <span className="text-muted-foreground">Phone:</span>
                                            <span>{getValues("emergencyContactPhone")}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <CardFooter className="flex justify-between px-0 pt-4">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isSubmitting}
                                    >
                                        Previous
                                    </Button>
                                )}
                                {step < 4 ? (
                                    <Button
                                        type="button"
                                        className="ml-auto"
                                        onClick={nextStep}
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="ml-auto bg-primary hover:bg-primary-dark"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Submit Registration
                                    </Button>
                                )}
                            </CardFooter>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
