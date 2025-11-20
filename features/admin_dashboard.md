# Admin Dashboard Features - Detailed Specification

## 1. Overview
The Admin Dashboard is the command center. It requires a high-density information layout, quick access to management tools, and robust error handling. It is accessible ONLY to users with `role: "admin"` or `role: "superadmin"`.

## 2. User Flows & Features

### 2.1 Dashboard Home (Overview)
*   **Visuals**: 4 Top Cards displaying key metrics.
    *   **Total Patients**: Count of all records in `patients`.
    *   **Active Doctors**: Count of `doctors` where `status === 'active'`.
    *   **Appointments Today**: Count of `appointments` where `date` matches today.
    *   **Pending Approvals**: Count of `doctor_registrations` where `status === 'pending'`.
*   **Activity Feed**: A scrollable list of recent system actions (e.g., "Dr. Smith updated patient X", "New appointment booked").

### 2.2 Manage Doctors
*   **List View**: Table showing Name, Specialty, Status, and Actions.
*   **Add Doctor**:
    *   Admins can manually invite doctors or approve pending registrations.
    *   **Approval Flow**:
        1.  Go to "Pending Requests" tab.
        2.  Review applicant details (License, Bio).
        3.  Click "Approve".
        4.  System moves record to `doctors` table and sends email notification (mocked or real).
*   **Edit/Deactivate**:
    *   Click "Edit" to change department or phone number.
    *   Click "Deactivate" to prevent login (sets `status: "inactive"`).

### 2.3 Manage Patients
*   **List View**: Searchable table of patients.
*   **Patient Profile**:
    *   Clicking a row opens a detailed view.
    *   Shows personal info, appointment history, and medical records (Read-Only).
*   **Actions**:
    *   **Delete**: Soft delete (mark as archived) or hard delete (GDPR compliance).

### 2.4 Appointment Management
*   **Calendar View**: A full-calendar view showing all hospital appointments.
*   **List View**: Filterable by Date, Doctor, Status.
*   **Actions**:
    *   **Reschedule**: Admin can override any appointment time.
    *   **Cancel**: Admin can cancel with a reason.

### 2.5 System Settings
*   **Content Management**: Update homepage banner text or announcement bar.
*   **Backup**: Trigger a manual snapshot of the Convex database.

## 3. Data Model (Convex Schema)

### `appointments`
```typescript
export const appointments = defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    date: v.number(), // Unix timestamp
    status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled")
    ),
    reason: v.string(),
    notes: v.optional(v.string()),
}).index("by_date", ["date"])
  .index("by_doctor", ["doctorId"])
  .index("by_patient", ["patientId"]);
```

### `logs` (System Activity)
```typescript
export const logs = defineTable({
    actorId: v.string(), // User ID who performed action
    action: v.string(), // e.g., "APPROVE_DOCTOR"
    targetId: v.optional(v.string()), // ID of object affected
    details: v.optional(v.string()),
    timestamp: v.number(),
}).index("by_timestamp", ["timestamp"]);
```

## 4. API Interface (Convex Functions)

### Queries
*   `admin.getStats()`: Aggregates counts for the dashboard cards. Optimized to avoid scanning full tables if possible.
*   `admin.getAllDoctors()`: Returns list of doctors with pagination.
*   `admin.getAllPatients()`: Returns list of patients with pagination.
*   `admin.getSystemLogs()`: Returns recent logs.

### Mutations
*   `admin.approveDoctor(registrationId)`: Transactional move from registration to doctor table.
*   `admin.updateDoctorStatus(doctorId, status)`: Toggles active/inactive.
*   `admin.deletePatient(patientId)`: Removes patient and cascades to appointments (or archives them).
*   `admin.updateAppointment(appointmentId, updates)`: Admin override for appointments.

## 5. UI Components

### `AdminSidebar`
*   Collapsible sidebar with links: Dashboard, Doctors, Patients, Appointments, Settings.
*   Active state highlighting.

### `DataTable` (Generic)
*   Built with `@tanstack/react-table`.
*   Features: Sorting, Filtering, Pagination.
*   Columns defined per page (e.g., Doctor Columns, Patient Columns).

### `StatCard`
*   Props: `title`, `value`, `icon`, `trend` (e.g., "+5% from last week").
*   Visual: Simple card with bold typography.

### `DoctorApprovalModal`
*   Dialog showing full application details.
*   "Approve" (Green) and "Reject" (Red) buttons.
*   Reject requires entering a reason.
