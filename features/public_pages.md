# Public (Non-Logged-In) Pages

## Overview
These pages are accessible to all visitors and serve to inform them about the hospital's services and facilitate entry into the system.

## Features

### 1. Homepage
- **Content**:
    - Welcome message.
    - System overview (secure records, appointments, monitoring).
    - **Call to Action**: "Login" / "Register as Patient".
- **Implementation**:
    - `app/page.tsx` (already exists).
    - Needs dynamic CTA based on auth status.

### 2. About
- **Content**:
    - Vision & mission.
    - Project description.
    - Data security explanation.
- **Implementation**:
    - Static page `app/about/page.tsx`.

### 3. Departments / Services
- **Content**:
    - List of departments: Cardiology, Dermatology, Gynecology, Pediatrics, General Medicine.
- **Implementation**:
    - Static page `app/services/page.tsx` or section on Homepage.

### 4. Contact Page
- **Content**:
    - Contact form.
    - Address, Phone, Email.
- **Implementation**:
    - `app/contact/page.tsx`.
    - Form submission could log to a `contact_requests` table or send email.

## Technical Implementation

### Components
- `Navbar`: Global navigation (already exists).
- `Hero`: Main banner on homepage.
- `Footer`: Site-wide footer.
- `ServiceCard`: Display for departments.
