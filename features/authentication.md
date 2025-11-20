# Login & Authentication Features - Detailed Specification

## 1. Overview
Authentication is the gateway to the hospital management system. It must be secure, user-friendly, and intelligent enough to route users to their specific dashboards based on their assigned roles (Patient, Doctor, Admin). The system leverages Clerk for identity management and Convex for role persistence and application data.

## 2. User Flows

### 2.1 Login Flow
1.  **User Action**: User clicks "Login" on the homepage.
2.  **Interface**: Redirects to `/sign-in` (Clerk hosted or custom UI).
3.  **Input**: User enters Email/Username and Password.
4.  **Validation**:
    *   Email format check.
    *   Password complexity check (handled by Clerk).
5.  **Success**:
    *   Clerk authenticates the user and issues a session token.
    *   **Role Check**: The application (via a `ConvexProvider` wrapper or middleware) queries the `doctors` table to check if the user is a doctor or admin. If not found, it checks the `patients` table.
6.  **Routing**:
    *   **Admin**: Redirects to `/admin-dashboard`.
    *   **Doctor**: Redirects to `/doctor-dashboard`.
    *   **Patient**: Redirects to `/dashboard`.
    *   **Unregistered**: If the user exists in Clerk but not in Convex (edge case), redirect to `/registration` or `/doctor-registration`.

### 2.2 Patient Registration Flow
1.  **User Action**: User clicks "Register as Patient".
2.  **Interface**: Navigates to `/registration`.
3.  **Step 1: Account Creation**:
    *   User signs up via Clerk (Email/Password or Social).
4.  **Step 2: Profile Completion** (Protected Route):
    *   User fills out the detailed form:
        *   **Full Name**: Required, min 2 chars.
        *   **Date of Birth**: Required, must be in the past.
        *   **Gender**: Dropdown (Male/Female/Other).
        *   **Phone**: Regex validation for format.
        *   **Address**: Multiline text area.
        *   **Upload ID**: Optional file upload (stored in Convex storage).
5.  **Submission**:
    *   Frontend calls `mutation: createPatient`.
    *   Mutation validates data and inserts into `patients` table.
6.  **Post-Registration**:
    *   User is redirected to `/dashboard`.

### 2.3 Doctor Registration Flow
1.  **User Action**: User navigates to `/doctor-registration`.
2.  **Step 1: Account Creation**:
    *   User signs up via Clerk.
3.  **Step 2: Application Form**:
    *   User fills out professional details:
        *   **License Number**: Required, unique check.
        *   **Medical School**: Required.
        *   **Specialty**: Dropdown (Cardiology, Pediatrics, etc.).
        *   **Bio**: Short professional summary.
4.  **Submission**:
    *   Frontend calls `mutation: submitDoctorApplication`.
    *   Data is saved to `doctor_registrations` with status `pending`.
5.  **Feedback**:
    *   User sees a "Application Pending" screen. They cannot access the Doctor Dashboard until approved by an Admin.

### 2.4 Password Reset
1.  **User Action**: Click "Forgot Password?" on login screen.
2.  **Flow**:
    *   Enter Email.
    *   Receive OTP (One Time Password) via Email.
    *   Enter OTP.
    *   Set New Password.
3.  **Technical**: Entirely handled by Clerk's `UserProfile` or custom flow using Clerk API.

## 3. Data Model (Convex Schema)

### `patients`
Stores confirmed patient profiles.
```typescript
export const patients = defineTable({
    userId: v.string(), // Clerk ID (Indexed)
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    dob: v.string(),
    gender: v.string(),
    address: v.string(),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.string()),
    chronicConditions: v.optional(v.string()),
    emergencyContact: v.object({
        name: v.string(),
        relation: v.string(),
        phone: v.string(),
    }),
    createdAt: v.number(),
}).index("by_userId", ["userId"]);
```

### `doctors`
Stores active doctor and admin profiles.
```typescript
export const doctors = defineTable({
    userId: v.string(), // Clerk ID (Indexed)
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("superadmin"), v.literal("doctor")),
    specialty: v.string(),
    details: v.object({ // Denormalized from registration
        licenseNumber: v.string(),
        phone: v.string(),
        bio: v.string(),
        // ... other fields
    }),
    status: v.union(v.literal("active"), v.literal("inactive")),
}).index("by_userId", ["userId"]);
```

### `doctor_registrations`
Stores pending applications.
```typescript
export const doctor_registrations = defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    details: v.object({ ... }), // Same as above
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
}).index("by_userId", ["userId"]).index("by_status", ["status"]);
```

## 4. API Interface (Convex Functions)

### Queries
*   `users.currentUser()`: Returns the current user's profile from either `patients` or `doctors` based on `ctx.auth.getUserIdentity()`.
*   `doctors.getRegistrationStatus(userId)`: Returns the status of a doctor's application.

### Mutations
*   `patients.create(data)`: Creates a new patient record. Throws error if `userId` already exists.
*   `doctors.submitApplication(data)`: Creates a `doctor_registrations` record.
*   `doctors.approveApplication(registrationId)`: **Admin Only**. Moves data from `doctor_registrations` to `doctors` and sets role to `doctor`.

## 5. UI Components

### `AuthCheck.tsx`
A wrapper component that handles the logic:
```tsx
const { user } = useUser();
const userData = useQuery(api.users.currentUser);

if (!user) return <SignIn />;
if (userData === undefined) return <Loading />;
if (userData === null) return <Redirect to="/registration" />; // Or specific logic
// Render children
```

### `RegistrationForm.tsx`
*   Uses `react-hook-form` + `zod` for validation.
*   Multi-step wizard layout (Step 1: Personal, Step 2: Medical History).
*   Handles file upload for ID via `useUploadFiles` (Convex).
