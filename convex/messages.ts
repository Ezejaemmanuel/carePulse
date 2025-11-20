import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMessages = query({
    args: { patientId: v.optional(v.id("patients")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        let patientId = args.patientId;

        // If no patientId provided, try to infer from logged-in user
        if (!patientId) {
            const patient = await ctx.db
                .query("patients")
                .filter((q) => q.eq(q.field("userId"), identity.subject))
                .first();

            if (patient) {
                patientId = patient._id;
            }
        }

        // If still no patientId (and user is doctor but didn't provide one), return empty
        if (!patientId) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_patient", (q) => q.eq("patientId", patientId!))
            .collect();

        return messages.sort((a, b) => a.createdAt - b.createdAt);
    },
});

export const sendMessage = mutation({
    args: {
        body: v.string(),
        patientId: v.optional(v.id("patients")), // Optional for patients, required for doctors
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        let patientId = args.patientId;
        let senderName = "User";
        let role: "patient" | "doctor" = "patient";

        // Check if sender is a doctor first (when patientId is explicitly provided)
        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        // Check if sender is a patient
        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        // Determine role based on context:
        // If patientId is provided AND user is a doctor, they're acting as a doctor
        if (args.patientId && doctor) {
            patientId = args.patientId;
            senderName = `Dr. ${doctor.name.split(" ").pop()}`;
            role = "doctor";
        } else if (patient) {
            // User is a patient (or doctor acting as patient without providing patientId)
            patientId = patient._id;
            senderName = patient.name;
            role = "patient";
        } else if (doctor) {
            // User is a doctor but didn't provide patientId
            throw new Error("Doctor must provide patientId");
        } else {
            throw new Error("User not found");
        }

        if (!patientId) throw new Error("Could not determine patient context");

        await ctx.db.insert("messages", {
            patientId,
            senderId: identity.subject,
            senderName,
            role,
            body: args.body,
            createdAt: Date.now(),
            isRead: false,
        });
    },
});

export const getDoctorConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Verify user is a doctor
        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) return [];

        // Get all messages (this is inefficient for scale, but fine for MVP)
        // Ideally, we'd have a separate 'conversations' table updated via triggers
        const allMessages = await ctx.db.query("messages").collect();

        // Group by patientId
        const conversationsMap = new Map();

        for (const msg of allMessages) {
            if (!conversationsMap.has(msg.patientId)) {
                const patient = await ctx.db.get(msg.patientId);
                if (patient) {
                    conversationsMap.set(msg.patientId, {
                        patientId: msg.patientId,
                        patientName: patient.name,
                        lastMessage: msg,
                        unreadCount: 0
                    });
                }
            }

            const conv = conversationsMap.get(msg.patientId);
            if (msg.createdAt > conv.lastMessage.createdAt) {
                conv.lastMessage = msg;
            }
            if (!msg.isRead && msg.role === "patient") {
                conv.unreadCount++;
            }
        }

        return Array.from(conversationsMap.values()).sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
    },
});

export const markMessagesAsRead = mutation({
    args: { patientId: v.id("patients") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify user is a doctor
        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) throw new Error("Unauthorized");

        // Get all unread messages from this patient
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
            .filter((q) => q.and(
                q.eq(q.field("isRead"), false),
                q.eq(q.field("role"), "patient")
            ))
            .collect();

        // Mark them all as read
        await Promise.all(
            messages.map((msg) => ctx.db.patch(msg._id, { isRead: true }))
        );
    },
});
