"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Database, CheckCircle, AlertCircle, Users, Calendar, FileText, MessageSquare, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SeedResult {
  patients: number;
  doctors: number;
  appointments: number;
  message: string;
}

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedDatabase = useMutation(api.seed.seedDatabase);

  const handleSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Simulate progress updates
      const progressSteps = [
        { step: 10, message: "Initializing database seeding..." },
        { step: 20, message: "Creating patient records..." },
        { step: 40, message: "Creating doctor profiles..." },
        { step: 60, message: "Scheduling appointments..." },
        { step: 75, message: "Creating medical records..." },
        { step: 85, message: "Adding vital signs..." },
        { step: 95, message: "Setting up messaging..." },
      ];

      for (const { step, message } of progressSteps) {
        setProgress(step);
        toast.info(message);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const seedResult = await seedDatabase();
      setResult(seedResult);
      setProgress(100);
      toast.success("Database seeded successfully!");

    } catch (err) {
      console.error("Seeding failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast.error("Seeding failed. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  const stats = [
    {
      icon: Users,
      label: "Patients",
      value: result?.patients || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      label: "Doctors",
      value: result?.doctors || 0,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Calendar,
      label: "Appointments",
      value: result?.appointments || 0,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: FileText,
      label: "Medical Records",
      value: "~150",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: BarChart3,
      label: "Vital Signs",
      value: "~400",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      value: "~300",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Database Seeding</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Populate your hospital database with realistic fake data for testing and development.
            This will create additional patients and appointments for your existing doctors, medical records, and more.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>
              Click the button below to start seeding your database with fake data.
              This process will take a few seconds to complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Section */}
            {isSeeding && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Seeding in progress...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Seeding Failed:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Seed Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                size="lg"
                className="min-w-[200px]"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding Database...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Start Seeding
                  </>
                )}
              </Button>
            </div>

            {/* Success Message */}
            {result && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Stats */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Seeding Results
              </CardTitle>
              <CardDescription>
                Here&apos;s what was created in your database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${stat.bgColor} border-current/20`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-8 w-8 ${stat.color}`} />
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>What Gets Created</CardTitle>
            <CardDescription>
              The seeding process creates a comprehensive dataset for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Patient Data
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 100 patients with complete profiles</li>
                  <li>• Realistic names, emails, and contact info</li>
                  <li>• Medical history and emergency contacts</li>
                  <li>• Blood groups and allergy information</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Medical Records
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 200 appointments (past and future)</li>
                  <li>• Medical records with diagnoses</li>
                  <li>• Prescriptions and treatment plans</li>
                  <li>• Vital signs and health metrics</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Doctor Data
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Works with existing doctors in your database</li>
                  <li>• Adds new doctors if needed (maintains at least 20 total)</li>
                  <li>• Creates appointments for all available doctors</li>
                  <li>• Complete professional profiles</li>
                  <li>• License numbers and qualifications</li>
                  <li>• Medical school and graduation info</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Interactions
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 300+ messages between patients/doctors</li>
                  <li>• System logs and audit trails</li>
                  <li>• Appointment scheduling and management</li>
                  <li>• Realistic medical complaints</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}