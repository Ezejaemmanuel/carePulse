import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to get the current doctor
export const getCurrentDoctor = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        return doctor;
    },
});

export const getSchedule = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) return [];

        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
            .collect();

        // Enhance with patient details
        const enhancedAppointments = await Promise.all(
            appointments.map(async (appt) => {
                const patient = await ctx.db.get(appt.patientId);
                return { ...appt, patient };
            })
        );

        return enhancedAppointments.sort((a, b) => a.date - b.date);
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { patients: 0, appointments: 0, pending: 0 };

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) return { patients: 0, appointments: 0, pending: 0 };

        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
            .collect();

        const uniquePatients = new Set(appointments.map(a => a.patientId));
        const pending = appointments.filter(a => a.status === "pending").length;

        return {
            patients: uniquePatients.size,
            appointments: appointments.length,
            pending: pending,
        };
    },
});

export const getPatients = query({
    args: {},
    handler: async (ctx) => {
        // For now, return all patients. In a real app, might filter by doctor's patients.
        return await ctx.db.query("patients").collect();
    },
});

export const getPatientDetails = query({
    args: { patientId: v.id("patients") },
    handler: async (ctx, args) => {
        const patient = await ctx.db.get(args.patientId);
        if (!patient) return null;

        const records = await ctx.db
            .query("medical_records")
            .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
            .collect();

        const vitals = await ctx.db
            .query("vitals")
            .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
            .collect();

        return { patient, records, vitals };
    },
});

export const createConsultationRecord = mutation({
    args: {
        patientId: v.id("patients"),
        appointmentId: v.id("appointments"),
        symptoms: v.string(),
        diagnosis: v.string(),
        prescription: v.array(v.object({
            medicine: v.string(),
            dosage: v.string(),
            instructions: v.string(),
        })),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) throw new Error("Unauthorized");

        // Create medical record
        await ctx.db.insert("medical_records", {
            patientId: args.patientId,
            doctorId: doctor._id,
            appointmentId: args.appointmentId,
            date: Date.now(),
            symptoms: args.symptoms,
            diagnosis: args.diagnosis,
            prescription: args.prescription,
            privateNotes: args.notes,
            createdAt: Date.now(),
        });

        // Update appointment status
        await ctx.db.patch(args.appointmentId, {
            status: "completed",
        });
    },
});

export const confirmAppointment = mutation({
    args: { appointmentId: v.id("appointments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) throw new Error("Unauthorized");

        const appointment = await ctx.db.get(args.appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        if (appointment.doctorId !== doctor._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.appointmentId, { status: "confirmed" });
    },
});

export const cancelAppointment = mutation({
    args: { appointmentId: v.id("appointments") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) throw new Error("Unauthorized");

        const appointment = await ctx.db.get(args.appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        if (appointment.doctorId !== doctor._id) throw new Error("Unauthorized");

        await ctx.db.patch(args.appointmentId, { status: "cancelled" });
    },
});

export const updatePatientMedicalProfile = mutation({
    args: {
        patientId: v.id("patients"),
        allergies: v.optional(v.string()),
        chronicConditions: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const doctor = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!doctor) throw new Error("Unauthorized");

        await ctx.db.patch(args.patientId, {
            allergies: args.allergies,
            chronicConditions: args.chronicConditions,
        });
    },
});

export const updateDoctor = mutation({
    args: {
        doctorId: v.id("doctors"),
        role: v.optional(v.union(v.literal("admin"), v.literal("superadmin"), v.literal("doctor"))),
        specialty: v.optional(v.string()),
        status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("doctors")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
            throw new Error("Unauthorized");
        }

        const updates: any = {};
        if (args.role) updates.role = args.role;
        if (args.specialty) updates.specialty = args.specialty;
        if (args.status) updates.status = args.status;

        await ctx.db.patch(args.doctorId, updates);
    },
});
