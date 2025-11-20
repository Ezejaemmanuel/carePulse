import { defineTable } from "convex/server";
import { v } from "convex/values";

export const doctor_registrations = defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    details: v.object({
        phone: v.string(),
        gender: v.string(),
        dob: v.string(),
        address: v.string(),
        licenseNumber: v.string(),
        medicalSchool: v.string(),
        graduationYear: v.string(),
        primarySpecialty: v.string(),
        bio: v.string(),
    }),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
}).index("by_userId", ["userId"])
    .index("by_status", ["status"]);
