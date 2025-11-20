import { defineTable } from "convex/server";
import { v } from "convex/values";

export const patients = defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    dob: v.string(),
    gender: v.string(),
    address: v.string(),
    bloodGroup: v.string(),
    allergies: v.optional(v.string()),
    chronicConditions: v.optional(v.string()),
    emergencyContactName: v.string(),
    emergencyContactRelation: v.string(),
    emergencyContactPhone: v.string(),
    createdAt: v.number(),
});
