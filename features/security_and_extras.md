# Security & Extra Features - Detailed Specification

## 1. Security Architecture

### 1.1 Role-Based Access Control (RBAC)
The system enforces strict boundaries between roles.
*   **Implementation Strategy**:
    *   **Database Level**: Convex functions check `ctx.auth` and query the user's role before returning sensitive data.
        *   *Example*: `getMedicalRecords` checks if `user.role === 'doctor'` OR `record.patientId === user.id`.
    *   **Application Level**: Middleware (`middleware.ts` in Next.js) or Layout wrappers (`DashboardLayout`) redirect unauthorized users.
        *   *Example*: Accessing `/admin-dashboard` without `admin` role redirects to `/`.

### 1.2 Data Privacy & Compliance
*   **Encryption**: All data in transit is encrypted via SSL (HTTPS). Convex handles encryption at rest.
*   **Access Logs**:
    *   Critical actions (viewing a record, deleting a user) are logged to the `logs` table.
    *   Logs are immutable (cannot be deleted by normal admins).
*   **Session Management**:
    *   Clerk handles session expiry and token rotation.
    *   Auto-logout after inactivity (can be implemented via frontend timer).

## 2. Extra Features Specification

### 2.1 Dark Mode
*   **Tech**: `next-themes` + Tailwind `dark:` classes.
*   **Implementation**:
    *   Toggle button in Navbar.
    *   Persists preference in `localStorage`.
    *   All components must have `dark:bg-slate-900`, `dark:text-white` variants.

### 2.2 Notifications System
*   **Types**:
    *   **System**: "Appointment Confirmed", "New Message".
    *   **Email**: "Reset Password", "Welcome".
*   **Implementation**:
    *   **In-App**: A `notifications` table.
        ```typescript
        export const notifications = defineTable({
            userId: v.string(),
            title: v.string(),
            message: v.string(),
            link: v.optional(v.string()), // e.g., "/dashboard/appointments/123"
            read: v.boolean(),
            createdAt: v.number(),
        }).index("by_user", ["userId"]);
        ```
    *   **UI**: Bell icon in Navbar with a red badge count. Dropdown shows recent items.

### 2.3 PDF Export
*   **Use Case**: Patient wants to print a prescription.
*   **Tech**: `@react-pdf/renderer`.
*   **Flow**:
    1.  User clicks "Download PDF" on a Medical Record.
    2.  React renders a hidden PDF component populated with record data.
    3.  Browser initiates download of `prescription-{date}.pdf`.

### 2.4 AI Symptom Checker (Optional)
*   **Concept**: A chat bot that asks 3-5 questions to suggest a department.
*   **Flow**:
    1.  User: "I have a headache and blurry vision."
    2.  AI (OpenAI API): "How long has this been happening?"
    3.  User: "2 days."
    4.  AI: "You should see a General Physician or Ophthalmologist."
*   **Integration**:
    *   Convex Action calls OpenAI API.
    *   Returns text response to frontend.

## 3. Comprehensive Schema Summary
To support all features, the final Convex schema should include:
1.  `patients`
2.  `doctors`
3.  `doctor_registrations`
4.  `appointments`
5.  `medical_records`
6.  `messages`
7.  `notifications`
8.  `logs`
9.  `vitals` (optional)

This structure ensures all data requirements from the prompt are met with relational integrity (via ID references).
