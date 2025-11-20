import { defineTable } from "convex/server";
import { v } from "convex/values";

export const logs = defineTable({
    actorId: v.string(), // User ID who performed action
    action: v.string(), // e.g., "APPROVE_DOCTOR"
    targetId: v.optional(v.string()), // ID of object affected
    details: v.optional(v.string()),
    timestamp: v.number(),
}).index("by_timestamp", ["timestamp"]);
