# Patient Dashboard Features - Detailed Specification

## 1. Overview
The Patient Dashboard is designed for ease of use, accessibility, and reassurance. It gives patients control over their data and access to care.

## 2. User Flows & Features

### 2.1 Dashboard Home
*   **Welcome Card**: "Good Morning, [Name]".
*   **Next Appointment**: Prominent card showing Date, Time, and Doctor for the upcoming visit.
*   **Quick Actions**: "Book Appointment", "View Records", "Message Doctor".

### 2.2 Book Appointment
1.  **Select Department**: User chooses "Cardiology", "General", etc.
2.  **Select Doctor**: List of doctors in that department with availability.
3.  **Select Slot**: Calendar view showing available time slots (e.g., 9:00 AM, 9:30 AM).
    *   *Logic*: Must exclude times already booked in `appointments` table.
4.  **Confirm**: User reviews details and clicks "Book".
5.  **Result**: Appointment created with status `pending`.

### 2.3 Medical Records
*   **History View**: Chronological list of all past consultations.
*   **Details**:
    *   Clicking a record shows the Diagnosis, Prescriptions, and Lab Results.
    *   **Download**: Button to generate a PDF of the prescription or download lab images.

### 2.4 Profile & Settings
*   **Personal Info**: Edit address, phone number.
*   **Insurance**: Upload insurance card image.
*   **Security**: Change password (links to Clerk flow).

### 2.5 Messaging
*   **Doctor List**: Patients can only message doctors they have had an appointment with (or are assigned to).
*   **Chat**: Simple text interface to ask follow-up questions.

## 3. Data Model (Convex Schema)

### `appointments` (Revisited)
*   Used here for booking.
*   `status` flow: `pending` (User creates) -> `confirmed` (Doctor accepts) -> `completed` (Visit done).

### `vitals` (Optional Health Tracking)
```typescript
export const vitals = defineTable({
    patientId: v.id("patients"),
    date: v.number(),
    type: v.union(v.literal("bp"), v.literal("glucose"), v.literal("weight")),
    value: v.string(), // e.g., "120/80"
    unit: v.string(), // e.g., "mmHg"
}).index("by_patient", ["patientId"]);
```

## 4. API Interface (Convex Functions)

### Queries
*   `patient.getAppointments()`: Returns upcoming and past appointments.
*   `patient.getMedicalRecords()`: Returns all records linked to `patientId`.
*   `patient.getAvailableSlots(doctorId, date)`: Complex query.
    *   Fetches doctor's working hours.
    *   Fetches existing appointments for that day.
    *   Returns list of free slots.

### Mutations
*   `patient.bookAppointment(doctorId, date, reason)`: Creates `pending` appointment.
*   `patient.updateProfile(data)`: Updates `patients` table.
*   `patient.logVital(type, value)`: Adds entry to `vitals`.

## 5. UI Components

### `AppointmentWizard`
*   Step-by-step booking interface.
*   Step 1: Category/Doctor.
*   Step 2: Calendar (using `react-day-picker` or similar).
*   Step 3: Reason for visit.
*   Step 4: Confirmation.

### `RecordCard`
*   Displays a summary of a visit.
*   Date, Doctor Name, Diagnosis snippet.
*   "View Details" button.

### `VitalsChart`
*   Uses `recharts` to plot weight or glucose over time.
*   Simple line chart.
