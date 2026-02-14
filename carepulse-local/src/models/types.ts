// Type definitions for all data models

export interface User {
    id: string;
    email: string;
    password: string; // Hashed
    role: 'patient' | 'doctor' | 'admin';
    createdAt: number;
}

export interface Patient {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    dob: string; // ISO date string
    gender: 'male' | 'female' | 'other';
    address: string;
    bloodGroup: string;
    allergies?: string;
    chronicConditions?: string;
    emergencyContactName: string;
    emergencyContactRelation: string;
    emergencyContactPhone: string;
    createdAt: number;
}

export interface Doctor {
    id: string;
    userId: string;
    name: string;
    email: string;
    specialty: string;
    status: 'active' | 'inactive' | 'pending';
    imageUrl?: string;
    bio?: string;
    experience?: string;
    createdAt: number;
}

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    date: number; // Timestamp
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    reason: string;
    notes?: string;
    createdAt: number;
}

export interface Prescription {
    medicine: string;
    dosage: string;
    instructions: string;
}

export interface MedicalRecord {
    id: string;
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    date: number;
    symptoms?: string;
    diagnosis: string;
    prescription: Prescription[];
    notes?: string;
    privateNotes?: string; // Doctor-only
    createdAt: number;
}

export interface Vital {
    id: string;
    patientId: string;
    date: number;
    type: 'bp' | 'glucose' | 'weight' | 'heart_rate';
    value: string;
    unit: string;
    createdAt: number;
}

export interface Message {
    id: string;
    patientId: string; // The "room" identifier
    doctorId: string; // The specific doctor participating in the chat
    senderId: string; // User ID
    senderName: string;
    role: 'patient' | 'doctor';
    body: string;
    isRead: boolean;
    createdAt: number;
}

export interface Session {
    userId: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    expiresAt: number;
}
