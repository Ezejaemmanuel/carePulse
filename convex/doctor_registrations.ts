import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitRegistration = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const existing = await ctx.db
            .query("doctor_registrations")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        // Check if any doctors exist to determine if this should be a superadmin
        const allDoctors = await ctx.db.query("doctors").collect();
        const isFirstDoctor = allDoctors.length === 0;

        if (existing) {
            if (existing.status === "pending") {
                await ctx.db.patch(existing._id, {
                    name: args.name,
                    email: args.email,
                    details: args.details,
                    submittedAt: Date.now(),
                });
                return existing._id;
            } else if (existing.status === "approved") {
                throw new Error("Already approved");
            }

            // If rejected, allow resubmission
            // If it's the first doctor (unlikely if they were rejected, but possible if they were the ONLY one and got rejected by... no one? logic edge case),
            // we should probably still apply the rule, but let's keep it simple for resubmission: just pending.
            // Actually, if they are the first one NOW (maybe previous ones were deleted?), they should be superadmin.
            // But for simplicity, let's stick to: if resubmitting, go to pending.

            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                details: args.details,
                status: isFirstDoctor ? "approved" : "pending",
                submittedAt: Date.now(),
            });

            if (isFirstDoctor) {
                await ctx.db.insert("doctors", {
                    userId: identity.subject,
                    name: args.name,
                    email: args.email,
                    role: "superadmin",
                    specialty: args.details.primarySpecialty,
                    status: "active",
                });
            }

            return existing._id;
        }

        const status = isFirstDoctor ? "approved" : "pending";

        const id = await ctx.db.insert("doctor_registrations", {
            userId: identity.subject,
            name: args.name,
            email: args.email,
            details: args.details,
            status: status,
            submittedAt: Date.now(),
        });

        if (isFirstDoctor) {
            await ctx.db.insert("doctors", {
                userId: identity.subject,
                name: args.name,
                email: args.email,
                role: "superadmin",
                specialty: args.details.primarySpecialty,
                status: "active",
            });
        }

        return id;
    },
});

export const getRegistrationStatus = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const registration = await ctx.db
            .query("doctor_registrations")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        return registration;
    },
});

export const getPendingRegistrations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Check if admin
        const doctor = await ctx.db
            .query("doctors")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!doctor || (doctor.role !== "admin" && doctor.role !== "superadmin")) {
            throw new Error("Unauthorized");
        }

        return await ctx.db
            .query("doctor_registrations")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();
    }
});

export const approveRegistration = mutation({
    args: { registrationId: v.id("doctor_registrations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Check if admin
        const admin = await ctx.db
            .query("doctors")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
            throw new Error("Unauthorized");
        }

        const registration = await ctx.db.get(args.registrationId);
        if (!registration) {
            throw new Error("Registration not found");
        }

        if (registration.status !== "pending") {
            throw new Error("Registration is not pending");
        }

        // Create doctor record
        await ctx.db.insert("doctors", {
            userId: registration.userId,
            name: registration.name,
            email: registration.email,
            role: "doctor", // Default role
            specialty: registration.details.primarySpecialty,
            status: "active",
        });

        // Update registration status
        await ctx.db.patch(args.registrationId, { status: "approved" });
    }
});

export const rejectRegistration = mutation({
    args: { registrationId: v.id("doctor_registrations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }

        // Check if admin
        const admin = await ctx.db
            .query("doctors")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.registrationId, { status: "rejected" });
    }
});
