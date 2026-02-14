import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/db.service';
import { initializeDatabase } from '../utils/seed.utils';
import '../utils/theme.utils';

// Initialize database on first load
initializeDatabase();

// Toast notification function
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `px-6 py-3 rounded-lg shadow-lg text-white mb-2 animate-slide-up ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
        }`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toggle patient fields visibility based on role selection
const signupRoleSelect = document.getElementById('signup-role') as HTMLSelectElement;
const patientFields = document.getElementById('patient-fields');

function togglePatientFields() {
    const role = signupRoleSelect?.value;
    if (patientFields) {
        if (role === 'patient') {
            patientFields.classList.remove('hidden');
            // Make patient fields required
            patientFields.querySelectorAll('input, select, textarea').forEach((field: any) => {
                if (field.id !== 'signup-allergies' && field.id !== 'signup-conditions') {
                    field.required = true;
                }
            });
        } else {
            patientFields.classList.add('hidden');
            // Make patient fields optional
            patientFields.querySelectorAll('input, select, textarea').forEach((field: any) => {
                field.required = false;
            });
        }
    }
}

// Initialize patient fields visibility
togglePatientFields();

signupRoleSelect?.addEventListener('change', togglePatientFields);

// Tab switching
const signinTab = document.getElementById('signin-tab');
const signupTab = document.getElementById('signup-tab');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');

const activeClasses = ['bg-white', 'dark:bg-black', 'text-gray-900', 'dark:text-white', 'shadow-sm'];
const inactiveClasses = ['text-gray-500', 'hover:text-gray-900', 'dark:hover:text-gray-200'];

// Set initial state
signinTab?.classList.add(...activeClasses);
signupTab?.classList.add(...inactiveClasses);

signinTab?.addEventListener('click', () => {
    // Active Sign In
    signinTab.classList.add(...activeClasses);
    signinTab.classList.remove(...inactiveClasses);

    // Inactive Sign Up
    signupTab?.classList.remove(...activeClasses);
    signupTab?.classList.add(...inactiveClasses);

    signinForm?.classList.remove('hidden');
    signupForm?.classList.add('hidden');
});

signupTab?.addEventListener('click', () => {
    // Active Sign Up
    signupTab.classList.add(...activeClasses);
    signupTab.classList.remove(...inactiveClasses);

    // Inactive Sign In
    signinTab?.classList.remove(...activeClasses);
    signinTab?.classList.add(...inactiveClasses);

    signupForm?.classList.remove('hidden');
    signinForm?.classList.add('hidden');
});

// Sign In
const signinFormElement = document.getElementById('signin-form-element') as HTMLFormElement;
signinFormElement?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('signin-email') as HTMLInputElement).value;
    const password = (document.getElementById('signin-password') as HTMLInputElement).value;

    try {
        const user = await AuthService.signIn(email, password);
        showToast('Sign in successful!', 'success');

        // Redirect based on role (doctor and admin both go to admin dashboard)
        setTimeout(() => {
            if (user.role === 'patient') {
                window.location.href = '/patient-dashboard.html';
            } else {
                // Both doctor and admin go to admin dashboard
                window.location.href = '/admin-dashboard.html';
            }
        }, 500);
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Sign in failed', 'error');
    }
});

// Sign Up
const signupFormElement = document.getElementById('signup-form-element') as HTMLFormElement;
signupFormElement?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('signup-email') as HTMLInputElement).value;
    const password = (document.getElementById('signup-password') as HTMLInputElement).value;
    const role = (document.getElementById('signup-role') as HTMLSelectElement).value as 'patient' | 'doctor' | 'admin';

    try {
        const user = await AuthService.signUp(email, password, role);
        
        // If user is a patient, create patient profile immediately
        if (role === 'patient') {
            const name = (document.getElementById('signup-name') as HTMLInputElement).value;
            const phone = (document.getElementById('signup-phone') as HTMLInputElement).value;
            const dob = (document.getElementById('signup-dob') as HTMLInputElement).value;
            const gender = (document.getElementById('signup-gender') as HTMLSelectElement).value;
            const bloodGroup = (document.getElementById('signup-blood-group') as HTMLSelectElement).value;
            const address = (document.getElementById('signup-address') as HTMLTextAreaElement).value;
            const emergencyContactName = (document.getElementById('signup-emergency-contact') as HTMLInputElement).value;
            const emergencyContactRelation = (document.getElementById('signup-emergency-relation') as HTMLInputElement).value;
            const emergencyContactPhone = (document.getElementById('signup-emergency-phone') as HTMLInputElement).value;

            // Create patient profile
            DatabaseService.createPatient({
                userId: user.id,
                name,
                email,
                phone,
                dob,
                gender: gender as 'male' | 'female' | 'other',
                address,
                bloodGroup,
                allergies: '',
                chronicConditions: '',
                emergencyContactName,
                emergencyContactRelation,
                emergencyContactPhone,
                createdAt: Date.now(),
            });
        }

        showToast('Account created successfully!', 'success');

        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'patient') {
                window.location.href = '/patient-dashboard.html';
            } else {
                // Both doctor and admin go to admin dashboard
                window.location.href = '/admin-dashboard.html';
            }
        }, 500);
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Sign up failed', 'error');
    }
});

// Check if already logged in
const session = AuthService.getSession();
if (session) {
    if (session.role === 'patient') {
        window.location.href = '/patient-dashboard.html';
    } else {
        // Both doctor and admin go to admin dashboard
        window.location.href = '/admin-dashboard.html';
    }
}
