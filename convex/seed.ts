import { mutation } from "./_generated/server";
import { faker } from "@faker-js/faker";
import { Doc } from "./_generated/dataModel";

// Hardcoded patient complaints/symptoms array
const PATIENT_COMPLAINTS = [
  "Severe headache for the past 3 days, not relieved by over-the-counter medications",
  "Persistent cough with green phlegm, difficulty breathing, and chest tightness",
  "Sharp chest pain that radiates to the left arm, accompanied by sweating and nausea",
  "Recurring stomach pain, nausea, and vomiting after eating, with weight loss",
  "Joint pain and stiffness in knees and hands, worse in the morning",
  "Frequent urinary tract infections with burning sensation during urination",
  "Chronic fatigue, unexplained weight gain, and feeling cold all the time",
  "Skin rash with itching, red patches spreading across arms and torso",
  "Dizziness and vertigo, episodes of room spinning, with ringing in ears",
  "High blood pressure readings at home, feeling lightheaded when standing up",
  "Irregular heartbeat, palpitations, and shortness of breath during exertion",
  "Back pain radiating down the right leg, numbness and tingling in foot",
  "Allergic reactions with hives, swelling of face, and difficulty breathing",
  "Chronic constipation and abdominal bloating, changes in bowel habits",
  "Anxiety attacks with rapid heartbeat, sweating, and fear of losing control",
  "Sleep disturbances, insomnia, and excessive daytime sleepiness",
  "Vision problems, blurred vision in right eye, and occasional double vision",
  "Hearing loss in left ear, accompanied by ear fullness and occasional dizziness",
  "Thyroid issues with goiter, difficulty swallowing, and voice changes",
  "Diabetes symptoms: excessive thirst, frequent urination, and slow-healing wounds",
  "Asthma exacerbation: wheezing, shortness of breath, and coughing at night",
  "Migraine headaches with aura, sensitivity to light and sound",
  "Gout attacks: sudden severe joint pain in big toe, redness and swelling",
  "Menstrual irregularities, heavy bleeding, and severe cramps",
  "Prostate issues: frequent urination at night, weak stream, and urgency",
  "Depression symptoms: persistent sadness, loss of interest, and suicidal thoughts",
  "Anxiety disorders: panic attacks, social withdrawal, and constant worry",
  "Eating disorders: binge eating followed by purging, fear of gaining weight",
  "Chronic pain in neck and shoulders, tension headaches",
  "Digestive issues: acid reflux, heartburn, and difficulty swallowing",
  "Allergy symptoms: runny nose, itchy eyes, and sneezing",
  "Cardiovascular concerns: high cholesterol, family history of heart disease",
  "Neurological symptoms: memory loss, confusion, and difficulty concentrating",
  "Orthopedic problems: knee pain with clicking, limited range of motion",
  "Dermatological issues: acne, psoriasis, and skin infections",
  "Respiratory problems: chronic bronchitis, shortness of breath on exertion",
  "Endocrine disorders: hormonal imbalances, hot flashes, and mood swings",
  "Gynecological concerns: abnormal pap smear, pelvic pain",
  "Urological problems: kidney stones, flank pain, and blood in urine",
  "Hematological issues: anemia, easy bruising, and fatigue",
  "Immunological disorders: frequent infections, autoimmune conditions",
  "Musculoskeletal pain: fibromyalgia, chronic fatigue syndrome",
  "Mental health: PTSD symptoms, nightmares, and hypervigilance",
  "Substance abuse: alcohol dependence, withdrawal symptoms",
  "Chronic illness management: diabetes, hypertension, and COPD",
  "Preventive care: annual check-ups, vaccinations, and cancer screenings",
  "Pediatric concerns: developmental delays, growth issues",
  "Geriatric care: mobility issues, dementia symptoms, polypharmacy",
  "Women's health: contraception counseling, pregnancy planning",
  "Men's health: prostate screening, testosterone levels, sexual health",
  "Sports medicine: injury prevention, performance optimization",
  "Occupational health: workplace injuries, ergonomic assessments",
  "Travel medicine: vaccinations, travel-related illnesses",
  "Nutrition counseling: weight management, dietary restrictions",
  "Mental wellness: stress management, mindfulness practices",
  "Sleep disorders: sleep apnea, insomnia treatment",
  "Pain management: chronic pain conditions, opioid therapy",
  "Wound care: diabetic ulcers, surgical wound healing",
  "Infection control: antibiotic stewardship, infection prevention",
  "Health education: disease prevention, lifestyle modifications",
  "Telemedicine consultations: remote monitoring, virtual visits"
];

// Medical specialties
const MEDICAL_SPECIALTIES = [
  "cardiology", "pediatrics", "neurology", "dermatology",
  "orthopedics", "general", "psychiatry", "gynecology",
  "urology", "ophthalmology", "otolaryngology", "radiology"
];

// Blood groups
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Medical schools
const MEDICAL_SCHOOLS = [
  "Harvard Medical School", "Johns Hopkins School of Medicine",
  "Mayo Clinic Alix School of Medicine", "Stanford University School of Medicine",
  "University of Pennsylvania Perelman School of Medicine",
  "University of California San Francisco School of Medicine",
  "Columbia University Vagelos College of Physicians and Surgeons",
  "Duke University School of Medicine", "University of Michigan Medical School",
  "Washington University School of Medicine in St. Louis"
];

// Vital types and their units/ranges
const VITAL_TYPES = {
  bp: { unit: "mmHg", min: "90/60", max: "180/120" },
  glucose: { unit: "mg/dL", min: "70", max: "200" },
  weight: { unit: "kg", min: "45", max: "120" },
  heart_rate: { unit: "bpm", min: "60", max: "100" }
};

// Common medicines with dosages
const MEDICINES = [
  { medicine: "Amoxicillin", dosage: "500mg", instructions: "Take 3 times daily for 7 days" },
  { medicine: "Lisinopril", dosage: "10mg", instructions: "Take once daily" },
  { medicine: "Metformin", dosage: "500mg", instructions: "Take twice daily with meals" },
  { medicine: "Aspirin", dosage: "81mg", instructions: "Take once daily" },
  { medicine: "Atorvastatin", dosage: "20mg", instructions: "Take once daily at bedtime" },
  { medicine: "Omeprazole", dosage: "20mg", instructions: "Take once daily before breakfast" },
  { medicine: "Prednisone", dosage: "10mg", instructions: "Take 4 tablets once daily for 5 days, then taper" },
  { medicine: "Warfarin", dosage: "5mg", instructions: "Take once daily, monitor INR weekly" },
  { medicine: "Levothyroxine", dosage: "75mcg", instructions: "Take once daily on empty stomach" },
  { medicine: "Albuterol", dosage: "90mcg", instructions: "Inhale 2 puffs every 4-6 hours as needed" },
  { medicine: "Ibuprofen", dosage: "400mg", instructions: "Take every 6-8 hours as needed for pain" },
  { medicine: "Acetaminophen", dosage: "500mg", instructions: "Take every 4-6 hours as needed" },
  { medicine: "Hydrochlorothiazide", dosage: "25mg", instructions: "Take once daily" },
  { medicine: "Gabapentin", dosage: "300mg", instructions: "Take 3 times daily" },
  { medicine: "Sertraline", dosage: "50mg", instructions: "Take once daily" }
];

// Common diagnoses
const DIAGNOSES = [
  "Essential Hypertension",
  "Type 2 Diabetes Mellitus",
  "Acute Bronchitis",
  "Major Depressive Disorder",
  "Osteoarthritis",
  "Gastroesophageal Reflux Disease",
  "Urinary Tract Infection",
  "Allergic Rhinitis",
  "Migraine Headache",
  "Acute Pharyngitis",
  "Atopic Dermatitis",
  "Acute Gastroenteritis",
  "Community-Acquired Pneumonia",
  "Acute Otitis Media",
  "Acute Sinusitis",
  "Acute Cystitis",
  "Tension Headache",
  "Low Back Pain",
  "Anxiety Disorder",
  "Obesity",
  "Hyperlipidemia",
  "Iron Deficiency Anemia",
  "Asthma",
  "Chronic Obstructive Pulmonary Disease",
  "Rheumatoid Arthritis",
  "Psoriasis",
  "Hypothyroidism",
  "Hyperthyroidism",
  "Acute Coronary Syndrome",
  "Cerebrovascular Accident",
  "Deep Vein Thrombosis",
  "Pulmonary Embolism",
  "Acute Kidney Injury",
  "Chronic Kidney Disease",
  "Liver Cirrhosis",
  "Hepatitis C",
  "Influenza",
  "COVID-19",
  "Cellulitis",
  "Septic Arthritis"
];

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database seeding...");

    // First, get existing doctors from the database
    const existingDoctors = await ctx.db.query("doctors").collect();
    console.log(`Found ${existingDoctors.length} existing doctors in database`);

    // Generate fake users and patients
    const patients = [];
    for (let i = 0; i < 100; i++) {
      const userId = `fake-user-${faker.string.uuid()}`;
      const patientData = {
        userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        dob: faker.date.birthdate({ min: 18, max: 85, mode: 'age' }).toISOString().split('T')[0],
        gender: faker.helpers.arrayElement(['male', 'female', 'other']),
        address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.state() + ' ' + faker.location.zipCode(),
        bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
        allergies: faker.helpers.maybe(() => faker.helpers.arrayElements([
          'Penicillin', 'Sulfa drugs', 'Aspirin', 'Codeine', 'Latex', 'Shellfish', 'Peanuts', 'Eggs'
        ], { min: 1, max: 3 }).join(', ')),
        chronicConditions: faker.helpers.maybe(() => faker.helpers.arrayElements([
          'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Depression', 'COPD'
        ], { min: 1, max: 2 }).join(', ')),
        emergencyContactName: faker.person.fullName(),
        emergencyContactRelation: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend']),
        emergencyContactPhone: faker.phone.number(),
        createdAt: Date.now() - faker.number.int({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
      };

      const patientId = await ctx.db.insert("patients", patientData);
      patients.push({ ...patientData, _id: patientId });
    }

    console.log(`Created ${patients.length} additional patients`);

    // Generate fake doctors (only if there are no existing doctors, or add more)
    const doctors: Doc<"doctors">[] = [...existingDoctors]; // Start with existing doctors
    const doctorsToCreate = existingDoctors.length === 0 ? 20 : Math.max(5, 20 - existingDoctors.length);

    for (let i = 0; i < doctorsToCreate; i++) {
      const userId = `fake-doctor-${faker.string.uuid()}`;
      const doctorData = {
        userId,
        name: `Dr. ${faker.person.fullName()}`,
        email: faker.internet.email(),
        role: existingDoctors.length === 0 && i === 0 ? 'superadmin' as const : faker.helpers.arrayElement(['admin', 'doctor'] as const),
        specialty: faker.helpers.arrayElement(MEDICAL_SPECIALTIES),
        status: 'active' as const
      };

      const doctorId = await ctx.db.insert("doctors", doctorData);
      // Get the full document after insertion to maintain type consistency
      const newDoctor = await ctx.db.get(doctorId);
      if (newDoctor) {
        doctors.push(newDoctor);
      }
    }

    console.log(`Total doctors available: ${doctors.length} (${existingDoctors.length} existing + ${doctors.length - existingDoctors.length} new)`);

    // Generate doctor registrations (some pending, some approved)
    for (let i = 0; i < 15; i++) {
      const userId = `fake-reg-${faker.string.uuid()}`;
      const registrationData = {
        userId,
        name: `Dr. ${faker.person.fullName()}`,
        email: faker.internet.email(),
        details: {
          phone: faker.phone.number(),
          gender: faker.helpers.arrayElement(['male', 'female']),
          dob: faker.date.birthdate({ min: 25, max: 70, mode: 'age' }).toISOString().split('T')[0],
          address: faker.location.streetAddress() + ', ' + faker.location.city(),
          licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
          medicalSchool: faker.helpers.arrayElement(MEDICAL_SCHOOLS),
          graduationYear: faker.date.past({ years: 20 }).getFullYear().toString(),
          primarySpecialty: faker.helpers.arrayElement(MEDICAL_SPECIALTIES),
          bio: faker.lorem.sentences(3)
        },
        status: faker.helpers.arrayElement(['pending', 'approved']),
        submittedAt: Date.now() - faker.number.int({ min: 0, max: 30 * 24 * 60 * 60 * 1000 })
      };

      await ctx.db.insert("doctor_registrations", registrationData);
    }

    console.log("Created doctor registrations");

    // Generate appointments
    const appointments = [];
    for (let i = 0; i < 200; i++) {
      const patient = faker.helpers.arrayElement(patients);
      const doctor = faker.helpers.arrayElement(doctors);

      // Generate appointment date (past and future)
      const isPast = faker.datatype.boolean(0.7); // 70% past appointments
      const baseDate = isPast ? faker.date.recent({ days: 60 }) : faker.date.soon({ days: 60 });

      // Set to business hours (9 AM - 5 PM)
      baseDate.setHours(faker.number.int({ min: 9, max: 16 }), faker.helpers.arrayElement([0, 30]), 0, 0);

      const appointmentData = {
        patientId: patient._id,
        doctorId: doctor._id,
        date: baseDate.getTime(),
        status: faker.helpers.arrayElement(['pending', 'confirmed', 'completed', 'cancelled']),
        reason: faker.helpers.arrayElement(PATIENT_COMPLAINTS),
        notes: faker.helpers.maybe(() => faker.lorem.sentences(2)),
        createdAt: baseDate.getTime() - faker.number.int({ min: 86400000, max: 604800000 }) // 1-7 days before
      };

      const appointmentId = await ctx.db.insert("appointments", appointmentData);
      appointments.push({ ...appointmentData, _id: appointmentId });
    }

    console.log(`Created ${appointments.length} appointments`);

    // Generate medical records for completed appointments
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    for (const appointment of completedAppointments.slice(0, 150)) { // Create records for 150 completed appointments
      const prescription = faker.helpers.maybe(() =>
        faker.helpers.arrayElements(MEDICINES, { min: 1, max: 3 })
      );

      const recordData = {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        date: appointment.date,
        symptoms: appointment.reason,
        diagnosis: faker.helpers.arrayElement(DIAGNOSES),
        prescription: prescription || faker.lorem.sentences(1),
        notes: faker.helpers.maybe(() => faker.lorem.sentences(2)),
        privateNotes: faker.helpers.maybe(() => faker.lorem.sentences(1)),
        attachments: faker.helpers.maybe(() => faker.helpers.arrayElements([
          faker.image.url(), faker.image.url()
        ], { min: 1, max: 2 })),
        createdAt: appointment.date + faker.number.int({ min: 3600000, max: 7200000 }) // 1-2 hours after appointment
      };

      await ctx.db.insert("medical_records", recordData);
    }

    console.log("Created medical records");

    // Generate vitals for patients
    for (const patient of patients.slice(0, 80)) { // Generate vitals for 80 patients
      const numVitals = faker.number.int({ min: 3, max: 15 });
      for (let i = 0; i < numVitals; i++) {
        const type = faker.helpers.arrayElement(Object.keys(VITAL_TYPES)) as keyof typeof VITAL_TYPES;
        const vitalInfo = VITAL_TYPES[type];

        let value: string;
        if (type === 'bp') {
          const systolic = faker.number.int({ min: 90, max: 180 });
          const diastolic = faker.number.int({ min: 60, max: 120 });
          value = `${systolic}/${diastolic}`;
        } else {
          const min = parseInt(vitalInfo.min);
          const max = parseInt(vitalInfo.max);
          value = faker.number.int({ min, max }).toString();
        }

        const vitalData = {
          patientId: patient._id,
          date: Date.now() - faker.number.int({ min: 0, max: 90 * 24 * 60 * 60 * 1000 }),
          type,
          value,
          unit: vitalInfo.unit,
          createdAt: Date.now() - faker.number.int({ min: 0, max: 90 * 24 * 60 * 60 * 1000 })
        };

        await ctx.db.insert("vitals", vitalData);
      }
    }

    console.log("Created vitals");

    // Generate messages between patients and doctors
    for (let i = 0; i < 300; i++) {
      const isFromPatient = faker.datatype.boolean();
      const patient = faker.helpers.arrayElement(patients);
      const doctor = faker.helpers.arrayElement(doctors);

      const messageData = {
        patientId: patient._id,
        senderId: isFromPatient ? patient.userId : doctor.userId,
        senderName: isFromPatient ? patient.name : doctor.name,
        role: (isFromPatient ? 'patient' : 'doctor') as 'patient' | 'doctor',
        body: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        createdAt: Date.now() - faker.number.int({ min: 0, max: 30 * 24 * 60 * 60 * 1000 }),
        isRead: faker.datatype.boolean(0.8) // 80% read
      };

      await ctx.db.insert("messages", messageData);
    }

    console.log("Created messages");

    // Generate logs
    const actions = ['APPROVE_DOCTOR', 'REJECT_DOCTOR', 'CREATE_APPOINTMENT', 'CANCEL_APPOINTMENT', 'UPDATE_PATIENT'];
    for (let i = 0; i < 100; i++) {
      const logData = {
        actorId: faker.helpers.arrayElement([...patients, ...doctors].map(p => p.userId)),
        action: faker.helpers.arrayElement(actions),
        targetId: faker.helpers.maybe(() => faker.string.uuid()),
        details: faker.helpers.maybe(() => faker.lorem.sentence()),
        timestamp: Date.now() - faker.number.int({ min: 0, max: 60 * 24 * 60 * 60 * 1000 })
      };

      await ctx.db.insert("logs", logData);
    }

    console.log("Created logs");

    console.log("Database seeding completed successfully!");
    return {
      patients: patients.length,
      doctors: doctors.length,
      appointments: appointments.length,
      message: "Database seeded with fake data successfully!"
    };
  },
});