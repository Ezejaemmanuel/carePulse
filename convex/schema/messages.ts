import { defineTable } from "convex/server";
import { v } from "convex/values";

export const messages = defineTable({
    patientId: v.id("patients"), // The "room" identifier
    senderId: v.string(), // User ID of sender (Clerk ID or Convex ID depending on auth)
    senderName: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor")),
    body: v.string(),
    createdAt: v.number(),
    isRead: v.boolean(),
})
    .index("by_patient", ["patientId"]);
