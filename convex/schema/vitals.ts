import { defineTable } from "convex/server";
import { v } from "convex/values";

export const vitals = defineTable({
    patientId: v.id("patients"),
    date: v.number(),
    type: v.union(v.literal("bp"), v.literal("glucose"), v.literal("weight"), v.literal("heart_rate")),
    value: v.string(),
    unit: v.string(),
    createdAt: v.number(),
})
    .index("by_patient", ["patientId"]);
