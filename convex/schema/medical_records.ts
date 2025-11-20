import { defineTable } from "convex/server";
import { v } from "convex/values";

export const medical_records = defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.optional(v.id("appointments")),
    date: v.number(),
    symptoms: v.optional(v.string()),
    diagnosis: v.string(),
    prescription: v.union(
        v.string(), // Legacy support or simple string
        v.array(v.object({
            medicine: v.string(),
            dosage: v.string(),
            instructions: v.string(),
        }))
    ),
    notes: v.optional(v.string()), // Public notes?
    privateNotes: v.optional(v.string()), // Doctor only
    attachments: v.optional(v.array(v.string())), // URLs to files
    createdAt: v.number(),
})
    .index("by_patient", ["patientId"]);
