"use client";

import RegistrationForm from "@/components/registration/RegistrationForm";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RegistrationPage() {
    const patient = useQuery(api.patients.getCurrentPatient);
    const router = useRouter();

    useEffect(() => {
        if (patient) {
            router.push("/dashboard");
        }
    }, [patient, router]);

    if (patient === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (patient) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-3xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        Patient Registration
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Please complete the form below to register with our hospital system.
                    </p>
                </div>
                <RegistrationForm />
            </div>
        </div>
    );
}
