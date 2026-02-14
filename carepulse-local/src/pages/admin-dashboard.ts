import { DatabaseService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { formatDate, formatTime } from '../utils/date.utils';
import type { Doctor, Patient, Message } from '../models/types';
import '../utils/theme.utils';

const session = AuthService.getSession()!;
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('page-title')!;
const pageSubtitle = document.getElementById('page-subtitle')!;
const content = document.getElementById('page-content')!;
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const mobileOverlay = document.getElementById('mobile-overlay');
// Initialize Dashboard
async function initDashboard() {
    if (!session || session.role !== 'admin') {
        window.location.href = '/auth.html';
        return;
    }

    // Check if user has a doctor profile
    const doctorProfile = DatabaseService.getDoctorByUserId(session.userId);

    if (!doctorProfile) {
        // Show registration form
        renderRegistrationForm();
        return;
    }

    // Handle navigation
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Initial load

    // Sign out handler
    document.getElementById('signout-btn')?.addEventListener('click', () => {
        AuthService.signOut();
        window.location.href = '/index.html';
    });

    // Mobile Sidebar Toggles
    function toggleSidebar() {
        sidebar?.classList.toggle('-translate-x-full');
        mobileOverlay?.classList.toggle('hidden');
    }

    mobileMenuBtn?.addEventListener('click', toggleSidebar);
    closeSidebarBtn?.addEventListener('click', toggleSidebar);
    mobileOverlay?.addEventListener('click', toggleSidebar);

    // Close sidebar on link click (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) { // lg breakpoint
                sidebar?.classList.add('-translate-x-full');
                mobileOverlay?.classList.add('hidden');
            }
        });
    });

    // Global event listener for dynamic buttons
    document.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('accept-appt-btn')) {
            const apptId = target.getAttribute('data-id');
            if (apptId) {
                await acceptAppointment(apptId);
            }
        }
    });
}

function renderRegistrationForm() {
    pageTitle.textContent = 'Complete Your Profile';
    pageSubtitle.textContent = 'Please provide your professional details to continue';

    // Hide sidebar for registration
    if (sidebar) sidebar.style.display = 'none';
    if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';

    content.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-black p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Doctor Registration</h2>
                
                <form id="doctor-registration-form" class="space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input type="text" id="doc-name" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Dr. John Doe">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                            <select id="doc-specialty" required class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="">Select Specialty</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Dermatology">Dermatology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="General Medicine">General Medicine</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                            <input type="number" id="doc-experience" required min="0" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="5">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                            <textarea id="doc-bio" rows="4" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Brief description about your practice..."></textarea>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-md hover:shadow-lg">
                        Complete Registration
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('doctor-registration-form')?.addEventListener('submit', handleRegistrationSubmit);
}

async function handleRegistrationSubmit(e: Event) {
    e.preventDefault();

    const name = (document.getElementById('doc-name') as HTMLInputElement).value;
    const specialty = (document.getElementById('doc-specialty') as HTMLSelectElement).value;
    const experience = (document.getElementById('doc-experience') as HTMLInputElement).value;
    const bio = (document.getElementById('doc-bio') as HTMLTextAreaElement).value;

    try {
        DatabaseService.createDoctor({
            userId: session.userId,
            name,
            email: session.email,
            specialty,
            experience,
            bio,
            status: 'active', // Auto-approve for now
            createdAt: Date.now()
        });

        // Show success and reload
        const container = document.getElementById('toast-container');
        if (container) {
            const toast = document.createElement('div');
            toast.className = 'px-6 py-3 rounded-lg shadow-lg text-white mb-2 animate-slide-up bg-green-500';
            toast.textContent = 'Profile created successfully!';
            container.appendChild(toast);
        }

        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error(error);
        alert('Failed to create profile. Please try again.');
    }
}

function handleNavigation() {
    const hashString = window.location.hash.slice(1) || 'overview';
    const [page, query] = hashString.split('?');

    // Update active state
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${page}`) {
            link.classList.add('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
            link.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        } else {
            link.classList.remove('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
            link.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        }
    });

    loadPage(page, query);
}

function loadPage(page: string, query?: string) {
    switch (page) {
        case 'overview':
            pageTitle.textContent = 'System Overview';
            pageSubtitle.textContent = 'Key metrics and recent activity';
            content.innerHTML = renderOverview();
            break;
        case 'doctors':
            pageTitle.textContent = 'Manage Doctors';
            pageSubtitle.textContent = 'Add and manage medical staff';
            content.innerHTML = renderDoctors();
            break;
        case 'patients':
            pageTitle.textContent = 'Manage Patients';
            pageSubtitle.textContent = 'View registered patients';
            content.innerHTML = renderPatients();
            break;
        case 'appointments':
            pageTitle.textContent = 'All Appointments';
            pageSubtitle.textContent = 'View system-wide appointments';
            content.innerHTML = renderAppointments();
            break;
        case 'my-appointments':
            pageTitle.textContent = 'My Appointments';
            pageSubtitle.textContent = 'Manage your personal schedule';
            content.innerHTML = renderMyAppointments();
            break;
        case 'messages':
            pageTitle.textContent = 'Messages';
            pageSubtitle.textContent = 'Patient comms';
            content.innerHTML = renderMessages(query);
            attachMessageHandlers();
            break;
        default:
            loadPage('overview');
    }
}

function renderOverview(): string {
    const doctors = DatabaseService.getDoctors();
    const patients = DatabaseService.getPatients();
    const appointments = DatabaseService.getAppointments();



    // Calculate stats
    const totalPatients = patients.length;
    const activeDoctors = doctors.filter(d => d.status === 'active').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = appointments.filter(a => a.date >= today.getTime() && a.date < tomorrow.getTime()).length;
    const pendingApprovals = doctors.filter(d => d.status === 'pending').length; // Assuming doctors have a pending status

    return `
    <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <!-- Total Patients -->
            <div class="rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 class="tracking-tight text-sm font-medium">Total Patients</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500 dark:text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="p-6 pt-0">
                    <div class="text-2xl font-bold">${totalPatients}</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Registered patients</p>
                </div>
            </div>

            <!-- Active Doctors -->
             <div class="rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 class="tracking-tight text-sm font-medium">Active Doctors</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500 dark:text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="p-6 pt-0">
                    <div class="text-2xl font-bold">${activeDoctors}</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Currently active</p>
                </div>
            </div>

            <!-- Appointments Today -->
             <div class="rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 class="tracking-tight text-sm font-medium">Appointments Today</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500 dark:text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                </div>
                <div class="p-6 pt-0">
                    <div class="text-2xl font-bold">${appointmentsToday}</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Scheduled for today</p>
                </div>
            </div>
            
             <!-- Pending Approvals -->
             <div class="rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 class="tracking-tight text-sm font-medium">Pending Approvals</h3>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-500 dark:text-gray-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="p-6 pt-0">
                    <div class="text-2xl font-bold">${pendingApprovals}</div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Doctor registrations</p>
                </div>
            </div>
        </div>
        
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <!-- Recent Activity -->
            <div class="col-span-4 rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h3 class="text-lg font-semibold leading-none tracking-tight">Recent Activity</h3>
                </div>
                <div class="p-6 pt-0">
                     <div class="space-y-8">
                         <p class="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
                     </div>
                </div>
            </div>

             <!-- System Health -->
            <div class="col-span-3 rounded-xl border bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm border-gray-200 dark:border-gray-800">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h3 class="text-lg font-semibold leading-none tracking-tight">System Health</h3>
                </div>
                <div class="p-6 pt-0">
                     <div class="flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-green-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        <span class="text-sm font-medium">All systems operational</span>
                    </div>
                    <div class="mt-4 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Database Status</span>
                            <span class="text-green-500 font-medium">Healthy</span>
                        </div>
                         <div class="flex justify-between text-sm">
                            <span class="text-gray-500 dark:text-gray-400">API Latency</span>
                            <span class="font-medium text-gray-900 dark:text-gray-100">45ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}

function renderDoctors(): string {
    const doctors = DatabaseService.getDoctors();
    return `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Medical Staff</h3>
            <button class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                + Add New Doctor
            </button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Doctor</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Specialty</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Experience</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    ${doctors.map(doc => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                                        ${doc.name.charAt(0)}
                                    </div>
                                    <span class="font-medium text-gray-900 dark:text-white">${doc.name}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${doc.specialty}</td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${doc.email}</td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${doc.experience ? doc.experience + ' years' : 'N/A'}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'active' ? 'bg-green-100 text-green-800' :
            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
        } uppercase">
                                    ${doc.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
  `;
}

function renderPatients(): string {
    const patients = DatabaseService.getPatients();
    return `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Patient</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Gender</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Blood Group</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">DOB</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    ${patients.map(p => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <td class="px-6 py-4">
                                <div class="font-medium text-gray-900 dark:text-white">${p.name}</div>
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                                ${p.email}<br>${p.phone}
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">${p.gender}</td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${p.bloodGroup}</td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${p.dob}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
  `;
}

function renderAppointments(): string {
    const appointments = DatabaseService.getAppointments();
    return `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Doctor</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Patient</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    ${appointments.sort((a, b) => b.date - a.date).map(appt => {
        const doctor = DatabaseService.findById<Doctor>('doctors', appt.doctorId);
        const patient = DatabaseService.findById<Patient>('patients', appt.patientId);

        return `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    ${formatDate(appt.date)}<br>
                                    ${formatTime(appt.date)}
                                </td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${doctor?.name || 'Unknown'}</td>
                                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${patient?.name || 'Unknown'}</td>
                                <td class="px-6 py-4">
                                     <span class="px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
            }">
                                        ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
  `;
}

function renderMyAppointments(): string {
    const doctor = DatabaseService.getDoctorByUserId(session.userId);

    if (!doctor) {
        return `
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                <p class="text-yellow-800 dark:text-yellow-300">You do not have a doctor profile associated with your account.</p>
            </div>
        `;
    }

    const appointments = DatabaseService.getAppointmentsWithPatients(doctor.id);

    return `
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Patient</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Reason</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                        <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    ${appointments.length === 0 ? `
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                No appointments found.
                            </td>
                        </tr>
                    ` : appointments.sort((a, b) => b.date - a.date).map(appt => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                                ${formatDate(appt.date)}<br>
                                ${formatTime(appt.date)}
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                                <div class="font-medium text-gray-900 dark:text-white">${appt.patient?.name || 'Unknown'}</div>
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${appt.reason || 'Check-up'}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
        }">
                                    ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                </span>
                            </td>
                                <td class="px-6 py-4">
                                    <div class="flex gap-2">
                                        <a href="#messages?patientId=${appt.patientId}" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Chat with Patient">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                        </a>
                                        ${appt.status === 'pending' ? `
                                            <button 
                                                class="accept-appt-btn text-primary-600 hover:text-primary-800 font-medium text-sm bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-lg transition"
                                                data-id="${appt.id}"
                                            >
                                                Accept
                                            </button>
                                        ` : '-'}
                                    </div>
                                </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
  `;
}

async function acceptAppointment(id: string) {
    try {
        DatabaseService.updateAppointment(id, { status: 'confirmed' });

        const container = document.getElementById('toast-container');
        if (container) {
            const toast = document.createElement('div');
            toast.className = 'px-6 py-3 rounded-lg shadow-lg text-white mb-2 animate-slide-up bg-green-500';
            toast.textContent = 'Appointment confirmed!';
            container.appendChild(toast);
        }

        // Refresh view if currently on my-appointments
        if (window.location.hash === '#my-appointments') {
            const content = document.getElementById('page-content');
            if (content) content.innerHTML = renderMyAppointments();
        }

    } catch (error) {
        console.error('Failed to accept appointment:', error);
        alert('Failed to accept appointment. Please try again.');
    }
}

function renderMessages(query?: string): string {
    const doctor = DatabaseService.getDoctorByUserId(session.userId);
    if (!doctor) return '<div class="p-6 text-center text-gray-500">Doctor profile not found for this admin.</div>';

    const params = new URLSearchParams(query);
    const selectedPatientId = params.get('patientId');

    // Get all messages for this doctor
    const allMessages = DatabaseService.getMessagesByDoctor(doctor.id);

    // Group by patient
    const patientMap = new Map<string, {
        patient: Patient,
        lastMessage: Message,
        unreadCount: number
    }>();

    allMessages.forEach(msg => {
        if (!patientMap.has(msg.patientId)) {
            const patient = DatabaseService.findById<Patient>('patients', msg.patientId);
            if (patient) {
                patientMap.set(msg.patientId, {
                    patient,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
        }

        const entry = patientMap.get(msg.patientId)!;
        if (msg.createdAt > entry.lastMessage.createdAt) {
            entry.lastMessage = msg;
        }
        if (!msg.isRead && msg.role === 'patient') {
            entry.unreadCount++;
        }
    });

    const conversations = Array.from(patientMap.values())
        .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    return `
        <div class="flex h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <!-- Sidebar list -->
            <div class="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <h3 class="font-semibold text-gray-700 dark:text-gray-300">Conversations</h3>
                </div>
                <div class="flex-1 overflow-y-auto">
                    ${conversations.length === 0 ? `
                        <div class="p-6 text-center text-gray-500 text-sm">No messages yet</div>
                    ` : conversations.map(conv => `
                        <a href="#messages?patientId=${conv.patient.id}" 
                           class="block p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${selectedPatientId === conv.patient.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}">
                            <div class="flex justify-between items-start mb-1">
                                <span class="font-medium text-gray-900 dark:text-white">${conv.patient.name}</span>
                                <span class="text-xs text-gray-500">${formatTime(conv.lastMessage.createdAt)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <p class="text-sm text-gray-500 truncate max-w-[120px]">${conv.lastMessage.body}</p>
                                ${conv.unreadCount > 0 ? `
                                    <span class="w-2.5 h-2.5 bg-red-500 rounded-full" title="${conv.unreadCount} unread"></span>
                                ` : ''}
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>

            <!-- Chat Area -->
            <div class="flex-1 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
                ${selectedPatientId ? renderChatArea(selectedPatientId, doctor.id) : `
                    <div class="flex-1 flex items-center justify-center text-gray-500">
                        <div class="text-center">
                            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                            <p>Select a conversation to view messages</p>
                        </div>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderChatArea(patientId: string, doctorId: string): string {
    const patient = DatabaseService.findById<Patient>('patients', patientId);
    if (!patient) return 'Patient not found';

    const messages = DatabaseService.getMessagesBetween(patientId, doctorId);

    // Mark messages as read
    messages.forEach(m => {
        if (!m.isRead && m.role === 'patient') {
            DatabaseService.markMessageAsRead(m.id);
        }
    });

    return `
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                ${patient.name.charAt(0)}
            </div>
            <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">${patient.name}</h3>
                <p class="text-xs text-gray-500">Patient</p>
            </div>
        </div>

        <!-- Messages -->
        <div id="doctor-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4">
            ${messages.sort((a, b) => a.createdAt - b.createdAt).map(msg => `
                <div class="flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[70%] rounded-2xl px-4 py-2 ${msg.role === 'doctor'
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
        }">
                        <p class="text-sm">${msg.body}</p>
                        <p class="text-[10px] mt-1 opacity-70 ${msg.role === 'doctor' ? 'text-primary-100' : 'text-gray-500'}">
                            ${formatTime(msg.createdAt)}
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <form id="doctor-chat-form" class="flex gap-2">
                <input type="hidden" id="chat-patient-id" value="${patientId}">
                <input 
                    type="text" 
                    id="doctor-message-input" 
                    placeholder="Type your reply..." 
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-800 dark:text-white"
                    required
                >
                <button 
                    type="submit" 
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                    <span>Send</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    `;
}

function attachMessageHandlers() {
    const doctor = DatabaseService.getDoctorByUserId(session.userId);
    if (!doctor) return;

    const form = document.getElementById('doctor-chat-form');
    const input = document.getElementById('doctor-message-input') as HTMLInputElement;
    const patientIdInput = document.getElementById('chat-patient-id') as HTMLInputElement;
    const container = document.getElementById('doctor-chat-messages');

    if (container) {
        container.scrollTop = container.scrollHeight;
    }

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const body = input.value.trim();
        const patientId = patientIdInput?.value;

        if (!body || !patientId) return;

        DatabaseService.createMessage({
            patientId: patientId,
            doctorId: doctor.id,  // Sender is doctor (admin's doctor profile)
            senderId: session.userId,
            senderName: doctor.name,
            role: 'doctor',
            body: body,
            isRead: false,
            createdAt: Date.now()
        });

        input.value = '';

        // Append message (optimistic UI)
        const newMsgHtml = `
            <div class="flex justify-end animate-slide-up">
                <div class="max-w-[70%] rounded-2xl px-4 py-2 bg-primary-600 text-white rounded-br-none">
                    <p class="text-sm">${body}</p>
                    <p class="text-[10px] mt-1 opacity-70 text-primary-100">
                        Just now
                    </p>
                </div>
            </div>
        `;
        if (container) {
            container.insertAdjacentHTML('beforeend', newMsgHtml);
            container.scrollTop = container.scrollHeight;
        }
    });
}

initDashboard();
