import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to check if user is admin
async function checkAdmin(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthenticated");
    }
    // In a real app, we'd check a specific admin role or table.
    // For now, we'll assume the frontend handles role checks or we check a specific claim.
    // However, based on the schema, `doctors` table has a `role` field.
    // Let's check if the user exists in `doctors` with role 'admin' or 'superadmin'.

    const user = await ctx.db
        .query("doctors")
        .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
        .first();

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        const totalPatients = (await ctx.db.query("patients").collect()).length;
        const activeDoctors = (await ctx.db.query("doctors").filter((q) => q.eq(q.field("status"), "active")).collect()).length;

        // For appointments today, we need to filter by date range.
        // Assuming `date` is a unix timestamp (ms).
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

        const appointmentsToday = (await ctx.db.query("appointments")
            .withIndex("by_date", (q) => q.gte("date", startOfDay).lt("date", endOfDay))
            .collect()).length;

        const pendingApprovals = (await ctx.db.query("doctor_registrations")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect()).length;

        return {
            totalPatients,
            activeDoctors,
            appointmentsToday,
            pendingApprovals,
        };
    },
});

export const getAllDoctors = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("doctors").collect();
    },
});

export const getAllPatients = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("patients").collect();
    },
});

export const getSystemLogs = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("logs").order("desc").take(20);
    },
});

export const getPendingRegistrations = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("doctor_registrations")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();
    },
});

export const getAllAppointments = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("appointments").order("desc").collect();
    },
});

export const approveDoctor = mutation({
    args: { registrationId: v.id("doctor_registrations") },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx);
        const registration = await ctx.db.get(args.registrationId);

        if (!registration) {
            throw new Error("Registration not found");
        }

        if (registration.status !== "pending") {
            throw new Error("Registration is not pending");
        }

        // Update registration status
        await ctx.db.patch(args.registrationId, { status: "approved" });

        // Create doctor record
        const doctorId = await ctx.db.insert("doctors", {
            userId: registration.userId,
            name: registration.name,
            email: registration.email,
            role: "doctor",
            specialty: registration.details.primarySpecialty,
            status: "active",
        });

        // Log action
        await ctx.db.insert("logs", {
            actorId: admin.userId,
            action: "APPROVE_DOCTOR",
            targetId: doctorId,
            details: `Approved doctor registration for ${registration.name}`,
            timestamp: Date.now(),
        });

        return doctorId;
    },
});

export const updateDoctorStatus = mutation({
    args: { doctorId: v.id("doctors"), status: v.union(v.literal("active"), v.literal("inactive")) },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx);

        await ctx.db.patch(args.doctorId, { status: args.status });

        await ctx.db.insert("logs", {
            actorId: admin.userId,
            action: "UPDATE_DOCTOR_STATUS",
            targetId: args.doctorId,
            details: `Updated status to ${args.status}`,
            timestamp: Date.now(),
        });
    },
});

export const deletePatient = mutation({
    args: { patientId: v.id("patients") },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx);

        // Soft delete or hard delete? Spec says "Soft delete (mark as archived) or hard delete".
        // Schema doesn't have "archived" status for patients yet.
        // For now, let's do a hard delete as per "deletePatient" name, but maybe we should add a status field to patients later.
        // Or just delete.

        await ctx.db.delete(args.patientId);

        // Also delete appointments?
        // "Removes patient and cascades to appointments"
        const appointments = await ctx.db.query("appointments").withIndex("by_patient", (q) => q.eq("patientId", args.patientId)).collect();
        for (const apt of appointments) {
            await ctx.db.delete(apt._id);
        }

        await ctx.db.insert("logs", {
            actorId: admin.userId,
            action: "DELETE_PATIENT",
            targetId: args.patientId,
            details: "Deleted patient and their appointments",
            timestamp: Date.now(),
        });
    },
});

export const updateAppointment = mutation({
    args: {
        appointmentId: v.id("appointments"),
        updates: v.object({
            date: v.optional(v.number()),
            status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("completed"), v.literal("cancelled"))),
        })
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx);

        await ctx.db.patch(args.appointmentId, args.updates);

        await ctx.db.insert("logs", {
            actorId: admin.userId,
            action: "UPDATE_APPOINTMENT",
            targetId: args.appointmentId,
            details: `Updated appointment: ${JSON.stringify(args.updates)}`,
            timestamp: Date.now(),
        });
    },
});
