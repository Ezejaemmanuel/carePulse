import { defineTable } from "convex/server";
import { v } from "convex/values";

export const appointments = defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    date: v.number(), // Timestamp
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("completed"), v.literal("cancelled")),
    reason: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
})
    .index("by_patient", ["patientId"])
    .index("by_doctor", ["doctorId"])
    .index("by_doctor_date", ["doctorId", "date"])
    .index("by_date", ["date"]);
