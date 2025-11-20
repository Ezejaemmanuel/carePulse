"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface PrescriptionItem {
    medicine: string;
    dosage: string;
    instructions: string;
}

interface PrescriptionBuilderProps {
    items: PrescriptionItem[];
    onChange: (items: PrescriptionItem[]) => void;
}

export function PrescriptionBuilder({ items, onChange }: PrescriptionBuilderProps) {
    const addItem = () => {
        onChange([...items, { medicine: "", dosage: "", instructions: "" }]);
    };

    const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Prescription</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" /> Add Medicine
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                    No medicines added yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="grid gap-3 md:grid-cols-12 items-end border p-3 rounded-md bg-muted/20">
                            <div className="md:col-span-4 space-y-1">
                                <Label className="text-xs">Medicine Name</Label>
                                <Input
                                    value={item.medicine}
                                    onChange={(e) => updateItem(index, "medicine", e.target.value)}
                                    placeholder="e.g. Amoxicillin"
                                />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                                <Label className="text-xs">Dosage</Label>
                                <Input
                                    value={item.dosage}
                                    onChange={(e) => updateItem(index, "dosage", e.target.value)}
                                    placeholder="e.g. 500mg"
                                />
                            </div>
                            <div className="md:col-span-4 space-y-1">
                                <Label className="text-xs">Instructions</Label>
                                <Input
                                    value={item.instructions}
                                    onChange={(e) => updateItem(index, "instructions", e.target.value)}
                                    placeholder="e.g. Twice daily after food"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
