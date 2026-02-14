import { DatabaseService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import type { Doctor } from '../models/types';

const DOCTOR_SPECIALTIES = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', bio: 'Specialized in heart diseases and cardiovascular health.' },
    { name: 'Dr. Michael Chen', specialty: 'Neurology', bio: 'Expert in brain and nervous system disorders.' },
    { name: 'Dr. Emily Davis', specialty: 'Pediatrics', bio: 'Dedicated to children\'s health and development.' },
    { name: 'Dr. James Wilson', specialty: 'Orthopedics', bio: 'Specialist in bone, joint, and muscle conditions.' },
];

export async function seedDoctors(): Promise<void> {
    console.log('Seeding doctors...');

    for (const doctorData of DOCTOR_SPECIALTIES) {
        try {
            // Create user account for doctor
            const email = `${doctorData.name.toLowerCase().replace(/\s+/g, '.')}@carepulse.local`;
            const user = await AuthService.signUp(email, 'doctor123', 'doctor');

            // Create doctor profile
            const doctor: Omit<Doctor, 'id'> = {
                userId: user.id,
                name: doctorData.name,
                email: email,
                specialty: doctorData.specialty,
                status: 'active',
                bio: doctorData.bio,
                imageUrl: `/doctors/${doctorData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                createdAt: Date.now(),
            };

            DatabaseService.createDoctor(doctor);
            console.log(`Created doctor: ${doctorData.name}`);
        } catch (error) {
            console.error(`Error creating doctor ${doctorData.name}:`, error);
        }
    }
}

export async function seedAdmin(): Promise<void> {
    console.log('Seeding admin account...');

    try {
        await AuthService.signUp('admin@carepulse.local', 'admin123', 'admin');
        console.log('Created admin account');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

export async function initializeDatabase(): Promise<void> {
    if (DatabaseService.isInitialized()) {
        console.log('Database already initialized');
        return;
    }

    console.log('Initializing database...');

    await seedAdmin();
    await seedDoctors();

    DatabaseService.markAsInitialized();
    console.log('Database initialization complete!');
}
