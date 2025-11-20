"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Database } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage global application settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="site-name">Site Name</Label>
                        <Input id="site-name" defaultValue="Hospital Management System" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" defaultValue="support@hospital.com" />
                    </div>
                    <Button>
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Backup and maintenance operations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label className="text-base">Database Backup</Label>
                            <p className="text-sm text-muted-foreground">
                                Trigger a manual backup of the current database state.
                            </p>
                        </div>
                        <Button variant="outline">
                            <Database className="w-4 h-4 mr-2" /> Trigger Backup
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
