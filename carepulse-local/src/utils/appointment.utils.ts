import { DatabaseService } from '../services/db.service';
import type { Appointment } from '../models/types';

/**
 * Generate time slots for a given date
 * @param date - Start of day timestamp
 * @param startHour - Start hour (default: 9 AM)
 * @param endHour - End hour (default: 5 PM)
 * @param intervalMinutes - Slot duration (default: 30 minutes)
 * @returns Array of timestamps
 */
export function generateTimeSlots(
    date: number,
    startHour: number = 9,
    endHour: number = 17,
    intervalMinutes: number = 30
): number[] {
    const slots: number[] = [];
    const currentSlot = new Date(date);
    currentSlot.setHours(startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);

    while (currentSlot < endTime) {
        slots.push(currentSlot.getTime());
        currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);
    }

    return slots;
}

/**
 * Get available time slots for a doctor on a specific date
 * @param doctorId - Doctor ID
 * @param date - Start of day timestamp
 * @returns Array of available timestamps
 */
export function getAvailableSlots(doctorId: string, date: number): number[] {
    const allSlots = generateTimeSlots(date);
    const nextDay = date + 24 * 60 * 60 * 1000;

    // Get existing appointments for this doctor on this day
    const appointments = DatabaseService.getAppointmentsByDoctor(doctorId);
    const bookedSlots = new Set(
        appointments
            .filter(appt =>
                appt.date >= date &&
                appt.date < nextDay &&
                appt.status !== 'cancelled'
            )
            .map(appt => appt.date)
    );

    // Filter out booked slots
    return allSlots.filter(slot => !bookedSlots.has(slot));
}

/**
 * Check if a time slot is already booked
 * @param doctorId - Doctor ID
 * @param date - Exact timestamp
 * @returns Conflict information
 */
export function checkConflict(
    doctorId: string,
    date: number
): { hasConflict: boolean; appointment?: Appointment } {
    const appointments = DatabaseService.getAppointmentsByDoctor(doctorId);
    const conflictingAppointment = appointments.find(
        appt => appt.date === date && appt.status !== 'cancelled'
    );

    return {
        hasConflict: !!conflictingAppointment,
        appointment: conflictingAppointment,
    };
}
