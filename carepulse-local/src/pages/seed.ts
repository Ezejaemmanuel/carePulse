import { DatabaseService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import '../utils/theme.utils';

const seedBtn = document.getElementById('seed-btn') as HTMLButtonElement;
const btnText = document.getElementById('btn-text')!;
const statusMessage = document.getElementById('status-message')!;

function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    statusMessage.classList.remove('hidden');
    statusMessage.className = `mt-4 p-4 rounded-lg ${type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
        type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' :
            'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
        }`;
    statusMessage.textContent = message;
}

seedBtn.addEventListener('click', async () => {
    seedBtn.disabled = true;
    btnText.textContent = 'Seeding...';
    showStatus('Generating sample data...', 'info');

    try {
        await seedDatabase();
        showStatus('✓ Database seeded successfully! You can now explore the dashboards with sample data.', 'success');
        btnText.textContent = 'Seed Again';
    } catch (error) {
        showStatus('✗ Failed to seed database. Please try again.', 'error');
        btnText.textContent = 'Retry';
        console.error(error);
    } finally {
        seedBtn.disabled = false;
    }
});

async function seedDatabase() {
    const now = Date.now();

    // Create sample doctors
    const doctors = [
        {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@carepulse.com',
            specialty: 'Cardiology',
            status: 'active' as const,
            bio: 'Board-certified cardiologist with 15 years of experience',
            experience: '15',
        },
        {
            name: 'Dr. Michael Chen',
            email: 'michael.chen@carepulse.com',
            specialty: 'Pediatrics',
            status: 'active' as const,
            bio: 'Specialized in child healthcare and development',
            experience: '12',
        },
        {
            name: 'Dr. Emily Rodriguez',
            email: 'emily.rodriguez@carepulse.com',
            specialty: 'Dermatology',
            status: 'active' as const,
            bio: 'Expert in skin conditions and cosmetic procedures',
            experience: '10',
        },
        {
            name: 'Dr. James Wilson',
            email: 'james.wilson@carepulse.com',
            specialty: 'Orthopedics',
            status: 'pending' as const,
            bio: 'Specialized in sports medicine and joint replacement',
            experience: '8',
        },
    ];

    const createdDoctors: string[] = [];
    for (const doctorData of doctors) {
        // Create user account
        const user = await AuthService.signUp(
            doctorData.email,
            'password123',
            'doctor'
        );

        // Create doctor profile
        const doctor = DatabaseService.createDoctor({
            userId: user.id,
            ...doctorData,
            createdAt: now,
        });

        createdDoctors.push(doctor.id);
    }

    // Create sample patients
    const patients = [
        {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1-555-0101',
            dob: '1985-03-15',
            gender: 'male' as const,
            address: '123 Main St, New York, NY 10001',
            bloodGroup: 'O+',
            allergies: 'Penicillin',
            emergencyContactName: 'Jane Smith',
            emergencyContactRelation: 'Spouse',
            emergencyContactPhone: '+1-555-0102',
        },
        {
            name: 'Emma Davis',
            email: 'emma.davis@example.com',
            phone: '+1-555-0201',
            dob: '1990-07-22',
            gender: 'female' as const,
            address: '456 Oak Ave, Los Angeles, CA 90001',
            bloodGroup: 'A+',
            emergencyContactName: 'Robert Davis',
            emergencyContactRelation: 'Father',
            emergencyContactPhone: '+1-555-0202',
        },
        {
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '+1-555-0301',
            dob: '1978-11-30',
            gender: 'male' as const,
            address: '789 Pine Rd, Chicago, IL 60601',
            bloodGroup: 'B+',
            chronicConditions: 'Type 2 Diabetes',
            emergencyContactName: 'Lisa Brown',
            emergencyContactRelation: 'Wife',
            emergencyContactPhone: '+1-555-0302',
        },
        {
            name: 'Sophia Martinez',
            email: 'sophia.martinez@example.com',
            phone: '+1-555-0401',
            dob: '1995-05-18',
            gender: 'female' as const,
            address: '321 Elm St, Houston, TX 77001',
            bloodGroup: 'AB+',
            emergencyContactName: 'Carlos Martinez',
            emergencyContactRelation: 'Brother',
            emergencyContactPhone: '+1-555-0402',
        },
        {
            name: 'David Lee',
            email: 'david.lee@example.com',
            phone: '+1-555-0501',
            dob: '1982-09-25',
            gender: 'male' as const,
            address: '654 Maple Dr, Phoenix, AZ 85001',
            bloodGroup: 'O-',
            allergies: 'Shellfish, Pollen',
            emergencyContactName: 'Amy Lee',
            emergencyContactRelation: 'Sister',
            emergencyContactPhone: '+1-555-0502',
        },
        {
            name: 'Olivia Taylor',
            email: 'olivia.taylor@example.com',
            phone: '+1-555-0601',
            dob: '1988-12-10',
            gender: 'female' as const,
            address: '987 Cedar Ln, Philadelphia, PA 19101',
            bloodGroup: 'A-',
            emergencyContactName: 'James Taylor',
            emergencyContactRelation: 'Husband',
            emergencyContactPhone: '+1-555-0602',
        },
    ];

    const createdPatients: string[] = [];
    for (const patientData of patients) {
        // Create user account
        const user = await AuthService.signUp(
            patientData.email,
            'password123',
            'patient'
        );

        // Create patient profile
        const patient = DatabaseService.createPatient({
            userId: user.id,
            ...patientData,
            createdAt: now,
        });

        createdPatients.push(patient.id);
    }

    // Create sample appointments (mix of past and future)
    const appointmentReasons = [
        'Annual checkup',
        'Follow-up consultation',
        'Skin rash examination',
        'Chest pain evaluation',
        'Knee pain assessment',
        'Vaccination',
        'Blood pressure monitoring',
        'Allergy consultation',
        'Routine physical exam',
        'Sports injury follow-up',
    ];

    const statuses: Array<'pending' | 'confirmed' | 'completed' | 'cancelled'> = ['pending', 'confirmed', 'completed'];

    for (let i = 0; i < 15; i++) {
        const patientId = createdPatients[Math.floor(Math.random() * createdPatients.length)];
        const doctorId = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];

        // Create appointments ranging from 30 days ago to 30 days in the future
        const daysOffset = Math.floor(Math.random() * 60) - 30;
        const appointmentDate = now + (daysOffset * 24 * 60 * 60 * 1000);

        // Set time to business hours (9 AM to 5 PM)
        const date = new Date(appointmentDate);
        date.setHours(9 + Math.floor(Math.random() * 8), [0, 30][Math.floor(Math.random() * 2)], 0, 0);

        const status = daysOffset < 0 ? 'completed' : statuses[Math.floor(Math.random() * statuses.length)];

        DatabaseService.createAppointment({
            patientId,
            doctorId,
            date: date.getTime(),
            status,
            reason: appointmentReasons[Math.floor(Math.random() * appointmentReasons.length)],
            notes: status === 'completed' ? 'Patient responded well to treatment' : undefined,
            createdAt: now,
        });
    }

    // Create some medical records for completed appointments
    const completedAppointments = DatabaseService.getAppointments().filter(a => a.status === 'completed');

    for (let i = 0; i < Math.min(5, completedAppointments.length); i++) {
        const appt = completedAppointments[i];

        DatabaseService.createMedicalRecord({
            patientId: appt.patientId,
            doctorId: appt.doctorId,
            appointmentId: appt.id,
            date: appt.date,
            symptoms: 'Patient reported mild symptoms',
            diagnosis: 'Routine checkup - all vitals normal',
            prescription: [
                {
                    medicine: 'Vitamin D3',
                    dosage: '1000 IU',
                    instructions: 'Take once daily with food',
                },
            ],
            notes: 'Patient is in good health. Recommended regular exercise and balanced diet.',
            createdAt: now,
        });
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdDoctors.length} doctors, ${createdPatients.length} patients, and 15 appointments`);
}

// Check auth
const session = AuthService.getSession();
if (!session || session.role !== 'admin') {
    window.location.href = '/auth.html';
}
