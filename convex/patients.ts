import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to get the current patient
export const getCurrentPatient = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        return patient;
    },
});

export const getAppointments = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!patient) return [];

        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
            .collect();

        // Enhance with doctor details
        const enhancedAppointments = await Promise.all(
            appointments.map(async (appt) => {
                const doctor = await ctx.db.get(appt.doctorId);
                return { ...appt, doctor };
            })
        );

        return enhancedAppointments;
    },
});

export const getMedicalRecords = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!patient) return [];

        const records = await ctx.db
            .query("medical_records")
            .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
            .collect();

        // Enhance with doctor details
        const enhancedRecords = await Promise.all(
            records.map(async (record) => {
                const doctor = await ctx.db.get(record.doctorId);
                return { ...record, doctor };
            })
        );

        return enhancedRecords;
    },
});

export const updateProfile = mutation({
    args: {
        id: v.id("patients"),
        address: v.string(),
        phone: v.string(),
        emergencyContactName: v.string(),
        emergencyContactPhone: v.string(),
        emergencyContactRelation: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // Verify ownership
        const patient = await ctx.db.get(args.id);
        if (!patient || patient.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            address: args.address,
            phone: args.phone,
            emergencyContactName: args.emergencyContactName,
            emergencyContactPhone: args.emergencyContactPhone,
            emergencyContactRelation: args.emergencyContactRelation,
        });
    },
});

export const getDoctors = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("doctors").filter(q => q.eq(q.field("status"), "active")).collect();
    },
});

export const getAvailableSlots = query({
    args: {
        doctorId: v.id("doctors"),
        date: v.number(), // Start of the day timestamp
    },
    handler: async (ctx, args) => {
        const { doctorId, date } = args;

        // Define working hours (e.g., 9 AM to 5 PM)
        const startHour = 9;
        const endHour = 17;
        const intervalMinutes = 30;

        // Get existing appointments for the doctor on this day
        // We need to query by range. Since we don't have a range index yet, we'll filter in memory for now
        // or use the by_doctor_date index if we store just the date part there.
        // But the schema has `date` as a number (timestamp).
        // Let's assume `date` passed in is the midnight timestamp of the day.

        const nextDay = date + 24 * 60 * 60 * 1000;

        const existingAppointments = await ctx.db
            .query("appointments")
            .withIndex("by_doctor", (q) => q.eq("doctorId", doctorId))
            .filter((q) => q.and(
                q.gte(q.field("date"), date),
                q.lt(q.field("date"), nextDay),
                q.neq(q.field("status"), "cancelled")
            ))
            .collect();

        const bookedTimes = new Set(existingAppointments.map((appt) => appt.date));

        const slots = [];
        let currentSlot = new Date(date);
        currentSlot.setHours(startHour, 0, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, 0, 0, 0);

        while (currentSlot < endTime) {
            const slotTimestamp = currentSlot.getTime();
            if (!bookedTimes.has(slotTimestamp)) {
                slots.push(slotTimestamp);
            }
            currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);
        }

        return slots;
    },
});

export const bookAppointment = mutation({
    args: {
        doctorId: v.id("doctors"),
        date: v.number(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!patient) throw new Error("Patient not found");

        // Check availability again to prevent race conditions
        const existing = await ctx.db
            .query("appointments")
            .withIndex("by_doctor_date", (q) => q.eq("doctorId", args.doctorId).eq("date", args.date))
            .first();

        if (existing && existing.status !== "cancelled") {
            throw new Error("Slot already booked");
        }

        await ctx.db.insert("appointments", {
            patientId: patient._id,
            doctorId: args.doctorId,
            date: args.date,
            status: "pending",
            reason: args.reason,
            createdAt: Date.now(),
        });
    },
});

export const logVital = mutation({
    args: {
        type: v.union(v.literal("bp"), v.literal("glucose"), v.literal("weight"), v.literal("heart_rate")),
        value: v.string(),
        unit: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!patient) throw new Error("Patient not found");

        await ctx.db.insert("vitals", {
            patientId: patient._id,
            date: Date.now(),
            type: args.type,
            value: args.value,
            unit: args.unit,
            createdAt: Date.now(),
        });
    },
});

export const getVitals = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const patient = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!patient) return [];

        return await ctx.db
            .query("vitals")
            .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
            .collect();
    },
});

export const register = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called register without authentication present");
        }

        const user = await ctx.db
            .query("patients")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (user !== null) {
            throw new Error("User is already registered");
        }

        const patientId = await ctx.db.insert("patients", {
            userId: identity.subject,
            name: args.name,
            email: args.email,
            phone: args.phone,
            dob: args.dob,
            gender: args.gender,
            address: args.address,
            bloodGroup: args.bloodGroup,
            allergies: args.allergies,
            chronicConditions: args.chronicConditions,
            emergencyContactName: args.emergencyContactName,
            emergencyContactRelation: args.emergencyContactRelation,
            emergencyContactPhone: args.emergencyContactPhone,
            createdAt: Date.now(),
        });

        return patientId;
    },
});
