# Doctor Dashboard Features - Detailed Specification

## 1. Overview
The Doctor Dashboard is a productivity tool for medical professionals. It focuses on schedule management and patient care. The UI should be clean, minimizing distractions during consultations.

## 2. User Flows & Features

### 2.1 Dashboard Home
*   **Snapshot**:
    *   "Next Patient": Highlights the immediate next appointment with a "Start Consultation" button.
    *   "Today's Schedule": Timeline view of the day.
    *   "Pending Requests": Appointment requests waiting for approval.

### 2.2 Appointment Management
*   **Requests**:
    *   Doctors receive appointment requests from patients.
    *   **Action**: Accept (moves to Confirmed) or Decline (requires reason).
*   **Schedule View**:
    *   Weekly/Daily calendar view.
    *   Block out time (e.g., "Lunch", "Surgery").

### 2.3 Consultation Workflow (The Core Feature)
1.  **Start**: Doctor clicks "Start Consultation" on an appointment.
2.  **Patient View**: Opens the Patient's Medical Record.
    *   **Left Panel**: Patient History (Past visits, allergies, chronic conditions).
    *   **Right Panel**: Current Consultation Form.
3.  **Form Fields**:
    *   **Symptoms**: Multi-line text.
    *   **Diagnosis**: Text or ICD-10 code search (optional).
    *   **Prescription**: Dynamic list builder (Drug Name, Dosage, Frequency, Duration).
    *   **Lab Orders**: Checkboxes for common tests (Blood, X-Ray).
    *   **Notes**: Private notes for the doctor.
4.  **Finish**:
    *   Click "Complete Consultation".
    *   **Effect**:
        *   Updates `appointment` status to `completed`.
        *   Creates new `medical_record` entry.
        *   Generates a PDF summary for the patient (optional).

### 2.4 Messaging
*   **Inbox**: List of active chats with patients.
*   **Chat Window**: Real-time messaging.
*   **Restrictions**: Doctors can close threads to prevent spam.

## 3. Data Model (Convex Schema)

### `medical_records`
```typescript
export const medical_records = defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentId: v.id("appointments"),
    date: v.number(),
    vitals: v.object({
        bp: v.optional(v.string()),
        weight: v.optional(v.number()),
        temp: v.optional(v.number()),
    }),
    symptoms: v.string(),
    diagnosis: v.string(),
    prescription: v.array(v.object({
        medicine: v.string(),
        dosage: v.string(),
        instructions: v.string(),
    })),
    attachments: v.optional(v.array(v.string())), // Storage IDs
    privateNotes: v.optional(v.string()),
}).index("by_patient", ["patientId"])
  .index("by_doctor", ["doctorId"]);
```

### `messages`
```typescript
export const messages = defineTable({
    threadId: v.string(), // unique conversation ID (e.g., patientId_doctorId)
    senderId: v.string(),
    content: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
}).index("by_thread", ["threadId"]);
```

## 4. API Interface (Convex Functions)

### Queries
*   `doctor.getSchedule(dateRange)`: Returns appointments for the specific doctor.
*   `doctor.getPatientHistory(patientId)`: Returns all medical records for a patient.
*   `doctor.getStats()`: Returns patient count, completed appointments count.

### Mutations
*   `doctor.respondToAppointment(appointmentId, decision)`: Updates status to `confirmed` or `cancelled`.
*   `doctor.createConsultationRecord(data)`: The main action to save medical data.
*   `doctor.sendMessage(threadId, content)`: Sends a chat message.

## 5. UI Components

### `ConsultationMode`
*   A full-screen or focused mode that hides the sidebar to maximize space for records.
*   Split-screen layout: History (Read) vs. Current (Write).

### `PrescriptionBuilder`
*   A dynamic form component.
*   "Add Medicine" button adds a new row.
*   Each row has inputs for Name, Dosage, Instructions.

### `PatientHistoryTimeline`
*   Vertical timeline component showing past visits.
*   Clicking an item expands to show details (Diagnosis, Prescriptions).
