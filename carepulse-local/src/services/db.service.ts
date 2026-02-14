import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';
import type {
    Patient,
    Doctor,
    Appointment,
    MedicalRecord,
    Vital,
    Message,
} from '../models/types';

export class DatabaseService {
    // Collection keys
    private static PATIENTS_KEY = 'patients';
    private static DOCTORS_KEY = 'doctors';
    private static APPOINTMENTS_KEY = 'appointments';
    private static MEDICAL_RECORDS_KEY = 'medical_records';
    private static VITALS_KEY = 'vitals';
    private static MESSAGES_KEY = 'messages';
    private static INITIALIZED_KEY = 'initialized';

    // Generic CRUD operations
    static find<T extends { id: string }>(
        collection: string,
        predicate?: (item: T) => boolean
    ): T[] {
        const items = StorageService.get<T[]>(collection) || [];
        return predicate ? items.filter(predicate) : items;
    }

    static findOne<T extends { id: string }>(
        collection: string,
        predicate: (item: T) => boolean
    ): T | null {
        const items = this.find(collection, predicate);
        return items[0] || null;
    }

    static findById<T extends { id: string }>(collection: string, id: string): T | null {
        return this.findOne(collection, (item: T) => item.id === id);
    }

    static create<T extends { id?: string }>(collection: string, data: Omit<T, 'id'>): T {
        const items = StorageService.get<T[]>(collection) || [];
        const newItem = {
            ...data,
            id: uuidv4(),
        } as T;
        items.push(newItem);
        StorageService.set(collection, items);
        return newItem;
    }

    static update<T extends { id: string }>(
        collection: string,
        id: string,
        data: Partial<Omit<T, 'id'>>
    ): T | null {
        const items = StorageService.get<T[]>(collection) || [];
        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            return null;
        }

        items[index] = { ...items[index], ...data };
        StorageService.set(collection, items);
        return items[index];
    }

    static delete(collection: string, id: string): boolean {
        const items = StorageService.get<any[]>(collection) || [];
        const filteredItems = items.filter(item => item.id !== id);

        if (filteredItems.length === items.length) {
            return false; // Item not found
        }

        StorageService.set(collection, filteredItems);
        return true;
    }

    // Specific entity methods
    static getPatients(): Patient[] {
        return this.find<Patient>(this.PATIENTS_KEY);
    }

    static getPatientByUserId(userId: string): Patient | null {
        return this.findOne<Patient>(this.PATIENTS_KEY, p => p.userId === userId);
    }

    static createPatient(data: Omit<Patient, 'id'>): Patient {
        return this.create<Patient>(this.PATIENTS_KEY, data);
    }

    static getDoctors(): Doctor[] {
        return this.find<Doctor>(this.DOCTORS_KEY, d => d.status === 'active');
    }

    static getAllDoctors(): Doctor[] {
        return this.find<Doctor>(this.DOCTORS_KEY);
    }

    static getDoctorByUserId(userId: string): Doctor | null {
        return this.findOne<Doctor>(this.DOCTORS_KEY, d => d.userId === userId);
    }

    static createDoctor(data: Omit<Doctor, 'id'>): Doctor {
        return this.create<Doctor>(this.DOCTORS_KEY, data);
    }

    static getAppointments(): Appointment[] {
        return this.find<Appointment>(this.APPOINTMENTS_KEY);
    }

    static getAppointmentsByPatient(patientId: string): Appointment[] {
        return this.find<Appointment>(this.APPOINTMENTS_KEY, a => a.patientId === patientId);
    }

    static getAppointmentsByDoctor(doctorId: string): Appointment[] {
        return this.find<Appointment>(this.APPOINTMENTS_KEY, a => a.doctorId === doctorId);
    }

    static createAppointment(data: Omit<Appointment, 'id'>): Appointment {
        return this.create<Appointment>(this.APPOINTMENTS_KEY, data);
    }

    static updateAppointment(id: string, data: Partial<Omit<Appointment, 'id'>>): Appointment | null {
        return this.update<Appointment>(this.APPOINTMENTS_KEY, id, data);
    }

    static getMedicalRecords(): MedicalRecord[] {
        return this.find<MedicalRecord>(this.MEDICAL_RECORDS_KEY);
    }

    static getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
        return this.find<MedicalRecord>(this.MEDICAL_RECORDS_KEY, r => r.patientId === patientId);
    }

    static createMedicalRecord(data: Omit<MedicalRecord, 'id'>): MedicalRecord {
        return this.create<MedicalRecord>(this.MEDICAL_RECORDS_KEY, data);
    }

    static getVitals(): Vital[] {
        return this.find<Vital>(this.VITALS_KEY);
    }

    static getVitalsByPatient(patientId: string): Vital[] {
        return this.find<Vital>(this.VITALS_KEY, v => v.patientId === patientId);
    }

    static createVital(data: Omit<Vital, 'id'>): Vital {
        return this.create<Vital>(this.VITALS_KEY, data);
    }

    static getMessages(): Message[] {
        return this.find<Message>(this.MESSAGES_KEY);
    }

    static getMessagesByPatient(patientId: string): Message[] {
        return this.find<Message>(this.MESSAGES_KEY, m => m.patientId === patientId);
    }

    static getMessagesByDoctor(doctorId: string): Message[] {
        return this.find<Message>(this.MESSAGES_KEY, m => m.doctorId === doctorId);
    }

    static getMessagesBetween(patientId: string, doctorId: string): Message[] {
        const messages = this.find<Message>(this.MESSAGES_KEY);
        console.log(`[getMessagesBetween] finding for patient=${patientId} doctor=${doctorId}`);
        const found = messages.filter(m => {
            const match = m.patientId === patientId && m.doctorId === doctorId;
            if (!match && m.patientId === patientId) {
                console.log(`[getMessagesBetween] Skipping message: expected doctor=${doctorId}, got=${m.doctorId}`);
            }
            return match;
        });
        console.log(`[getMessagesBetween] Found ${found.length} messages`);
        return found;
    }

    static createMessage(data: Omit<Message, 'id'>): Message {
        return this.create<Message>(this.MESSAGES_KEY, data);
    }

    static markMessageAsRead(id: string): void {
        this.update<Message>(this.MESSAGES_KEY, id, { isRead: true });
    }

    // Helper methods with relationships
    static getAppointmentsWithDoctors(patientId: string) {
        const appointments = this.getAppointmentsByPatient(patientId);
        return appointments.map(appt => ({
            ...appt,
            doctor: this.findById<Doctor>(this.DOCTORS_KEY, appt.doctorId),
        }));
    }

    static getAppointmentsWithPatients(doctorId: string) {
        const appointments = this.getAppointmentsByDoctor(doctorId);
        return appointments.map(appt => ({
            ...appt,
            patient: this.findById<Patient>(this.PATIENTS_KEY, appt.patientId),
        }));
    }

    static getMedicalRecordsWithDoctors(patientId: string) {
        const records = this.getMedicalRecordsByPatient(patientId);
        return records.map(record => ({
            ...record,
            doctor: this.findById<Doctor>(this.DOCTORS_KEY, record.doctorId),
        }));
    }

    static isInitialized(): boolean {
        return StorageService.get<boolean>(this.INITIALIZED_KEY) === true;
    }

    static markAsInitialized(): void {
        StorageService.set(this.INITIALIZED_KEY, true);
    }
}
