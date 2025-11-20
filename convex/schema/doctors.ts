import { defineTable } from "convex/server";
import { v } from "convex/values";

export const doctors = defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("superadmin"), v.literal("doctor")),
    specialty: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
}).index("by_userId", ["userId"]);
