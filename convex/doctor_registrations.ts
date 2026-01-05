import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper function to automatically assign appointments and data to new doctor
async function assignExistingDataToNewDoctor(ctx: MutationCtx, newDoctorId: Id<"doctors">, specialty: string) {
    // Get all active doctors (excluding the new one)
    const allDoctors = await ctx.db
        .query("doctors")
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

    const existingDoctors = allDoctors.filter((d: Doc<"doctors">) => d._id !== newDoctorId);
    if (existingDoctors.length === 0) return; // No existing doctors to reassign from

    // Get pending and future appointments that can be reassigned
    const now = Date.now();
    const futureAppointments = await ctx.db
        .query("appointments")
        .filter((q) =>
            q.and(
                q.neq(q.field("status"), "completed"),
                q.neq(q.field("status"), "cancelled"),
                q.gte(q.field("date"), now)
            )
        )
        .collect();

    // Group appointments by doctor to understand current load
    const doctorWorkloads = new Map<Id<"doctors">, number>();
    for (const doctor of existingDoctors) {
        const doctorAppointments = futureAppointments.filter((apt: Doc<"appointments">) => apt.doctorId === doctor._id);
        doctorWorkloads.set(doctor._id, doctorAppointments.length);
    }

    // Find the doctor with the most appointments to reassign some to the new doctor
    let maxWorkload = 0;
    let doctorToReassignFrom: Id<"doctors"> | null = null;

    for (const [doctorId, workload] of doctorWorkloads) {
        if (workload > maxWorkload) {
            maxWorkload = workload;
            doctorToReassignFrom = doctorId;
        }
    }

    if (!doctorToReassignFrom || maxWorkload <= 2) return; // Don't reassign if workload is low

    // Reassign up to 20% of appointments from the busiest doctor to the new doctor
    const appointmentsToReassign = futureAppointments
        .filter((apt: Doc<"appointments">) => apt.doctorId === doctorToReassignFrom)
        .slice(0, Math.max(1, Math.floor(maxWorkload * 0.2))); // At least 1, max 20%

    // Update the appointments to assign them to the new doctor
    for (const appointment of appointmentsToReassign) {
        await ctx.db.patch(appointment._id, {
            doctorId: newDoctorId,
            notes: (appointment.notes || "") + " [Reassigned to new doctor]"
        });
    }

    console.log(`Reassigned ${appointmentsToReassign.length} appointments to new doctor`);

    // Also assign some existing patient data if the specialty matches
    if (specialty && specialty !== "general") {
        // Find patients who have had appointments with doctors of the same specialty
        const specialtyDoctors = existingDoctors.filter((d: Doc<"doctors">) => d.specialty === specialty);
        if (specialtyDoctors.length > 0) {
            // Get patients who have seen doctors with the same specialty
            const specialtyDoctorIds = specialtyDoctors.map((d: Doc<"doctors">) => d._id);
            const specialtyAppointments = futureAppointments.filter((apt: Doc<"appointments">) =>
                specialtyDoctorIds.includes(apt.doctorId)
            );

            // Take some of these appointments for the new doctor
            const specialtyAppointmentsToReassign = specialtyAppointments
                .slice(0, Math.min(5, specialtyAppointments.length)); // Take up to 5

            for (const appointment of specialtyAppointmentsToReassign) {
                await ctx.db.patch(appointment._id, {
                    doctorId: newDoctorId,
                    notes: (appointment.notes || "") + " [Specialty-matched reassignment]"
                });
            }

            console.log(`Reassigned ${specialtyAppointmentsToReassign.length} specialty-matched appointments to new doctor`);
        }
    }
}

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

        // Auto-approve all doctor registrations (no more waiting for admin approval)
        const allDoctors = await ctx.db.query("doctors").collect();
        const isFirstDoctor = allDoctors.length === 0;

        if (existing) {
            if (existing.status === "approved") {
                throw new Error("Already approved");
            }

            // Update and auto-approve existing registration
            await ctx.db.patch(existing._id, {
                name: args.name,
                email: args.email,
                details: args.details,
                status: "approved",
                submittedAt: Date.now(),
            });

            // Create doctor record
            const doctorId = await ctx.db.insert("doctors", {
                userId: identity.subject,
                name: args.name,
                email: args.email,
                role: isFirstDoctor ? "superadmin" : "doctor",
                specialty: args.details.primarySpecialty,
                status: "active",
            });

            // Auto-assign existing appointments and data to new doctor
            await assignExistingDataToNewDoctor(ctx, doctorId, args.details.primarySpecialty);

            return existing._id;
        }

        // Auto-approve new registration
        const id = await ctx.db.insert("doctor_registrations", {
            userId: identity.subject,
            name: args.name,
            email: args.email,
            details: args.details,
            status: "approved",
            submittedAt: Date.now(),
        });

        // Create doctor record immediately
        const doctorId = await ctx.db.insert("doctors", {
            userId: identity.subject,
            name: args.name,
            email: args.email,
            role: isFirstDoctor ? "superadmin" : "doctor",
            specialty: args.details.primarySpecialty,
            status: "active",
        });

        // Auto-assign existing appointments and data to new doctor
        await assignExistingDataToNewDoctor(ctx, doctorId, args.details.primarySpecialty);

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
        const doctorId = await ctx.db.insert("doctors", {
            userId: registration.userId,
            name: registration.name,
            email: registration.email,
            role: "doctor", // Default role
            specialty: registration.details.primarySpecialty,
            status: "active",
        });

        // Auto-assign existing appointments and data to new doctor
        await assignExistingDataToNewDoctor(ctx, doctorId, registration.details.primarySpecialty);

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
