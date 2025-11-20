"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Activity, Heart, Scale, Droplets } from "lucide-react";

export default function VitalsPage() {
    const vitals = useQuery(api.patients.getVitals);
    const logVital = useMutation(api.patients.logVital);

    const [type, setType] = useState<"bp" | "glucose" | "weight" | "heart_rate">("heart_rate");
    const [value, setValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        setIsSubmitting(true);
        try {
            let unit = "";
            switch (type) {
                case "bp": unit = "mmHg"; break;
                case "glucose": unit = "mg/dL"; break;
                case "weight": unit = "kg"; break;
                case "heart_rate": unit = "bpm"; break;
            }

            await logVital({ type, value, unit });
            toast.success("Vital logged successfully");
            setValue("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to log vital");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (vitals === undefined) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Health Vitals</h1>
                <p className="text-muted-foreground">
                    Track your key health metrics over time.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" /> Heart Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {vitals.filter(v => v.type === "heart_rate").sort((a, b) => b.date - a.date)[0]?.value || "--"}
                            <span className="text-xs font-normal text-muted-foreground ml-1">bpm</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-primary" /> Glucose
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {vitals.filter(v => v.type === "glucose").sort((a, b) => b.date - a.date)[0]?.value || "--"}
                            <span className="text-xs font-normal text-muted-foreground ml-1">mg/dL</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Scale className="h-4 w-4 text-primary" /> Weight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {vitals.filter(v => v.type === "weight").sort((a, b) => b.date - a.date)[0]?.value || "--"}
                            <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" /> Blood Pressure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {vitals.filter(v => v.type === "bp").sort((a, b) => b.date - a.date)[0]?.value || "--"}
                            <span className="text-xs font-normal text-muted-foreground ml-1">mmHg</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <VitalsChart
                        data={vitals}
                        type="heart_rate"
                        title="Heart Rate History"
                        color="hsl(var(--primary))"
                    />
                    <VitalsChart
                        data={vitals}
                        type="weight"
                        title="Weight History"
                        color="#8884d8"
                    />
                    {/* Add more charts as needed */}
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Log New Entry</CardTitle>
                            <CardDescription>Record a new measurement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLog} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Metric Type</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="heart_rate">Heart Rate</SelectItem>
                                            <SelectItem value="glucose">Blood Glucose</SelectItem>
                                            <SelectItem value="weight">Weight</SelectItem>
                                            <SelectItem value="bp">Blood Pressure</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="e.g., 72"
                                            type="number"
                                            step="any"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {type === "heart_rate" && "Beats per minute (bpm)"}
                                        {type === "glucose" && "Milligrams per deciliter (mg/dL)"}
                                        {type === "weight" && "Kilograms (kg)"}
                                        {type === "bp" && "Systolic/Diastolic (mmHg) - enter Systolic only for chart"}
                                    </p>
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Entry"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
