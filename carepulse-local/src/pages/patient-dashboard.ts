import { DatabaseService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { getAvailableSlots, checkConflict } from '../utils/appointment.utils';
import { formatDate, formatTime, getStartOfDay } from '../utils/date.utils';
import type { Patient, Doctor, Appointment } from '../models/types';
import '../utils/theme.utils';

const session = AuthService.getSession()!;
let currentPatient: Patient | null = null;

// Toast notification
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

// Initialize
async function init() {
  currentPatient = DatabaseService.getPatientByUserId(session.userId);

  if (!currentPatient) {
    showRegistrationForm();
    return;
  }

  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = currentPatient.name;
  }

  // Show admin portal link if user is admin
  if (session.role === 'admin') {
    const adminPortalLink = document.getElementById('admin-portal-link');
    if (adminPortalLink) {
      adminPortalLink.classList.remove('hidden');
      adminPortalLink.classList.add('flex');
    }
  }

  // Initial navigation handled by hashchange/load listeners
}

// Mobile Sidebar Toggles
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const mobileOverlay = document.getElementById('mobile-overlay');

function toggleSidebar() {
  sidebar?.classList.toggle('-translate-x-full');
  mobileOverlay?.classList.toggle('hidden');
}

mobileMenuBtn?.addEventListener('click', toggleSidebar);
closeSidebarBtn?.addEventListener('click', toggleSidebar);
mobileOverlay?.addEventListener('click', toggleSidebar);

// Navigation
const navLinks = document.querySelectorAll('.nav-link');

function handleNavigation() {
  const hashString = window.location.hash.slice(1) || 'overview';
  const [page, query] = hashString.split('?');

  // Update active state
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${page}`) {
      link.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
      link.classList.add('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
    } else {
      link.classList.remove('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
      link.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
    }
  });

  // Close sidebar on mobile if open
  if (window.innerWidth < 1024) {
    sidebar?.classList.add('-translate-x-full');
    mobileOverlay?.classList.add('hidden');
  }

  loadPage(page, query);
}

window.addEventListener('hashchange', handleNavigation);

// Initial load
window.addEventListener('load', () => {
  // If no hash, default to overview
  if (!window.location.hash) {
    history.replaceState(null, '', '#overview');
  }
  handleNavigation();
});

// Sidebar links don't need manual click handlers anymore as they use href="#..."
// But we might want to keep prevention of default if we want smooth transitions without hash in URL? 
// Actually, using hash is better for back button support. 
// So we can remove the manual click listeners on navLinks if they are just setting hash.
// However, the existing code prevented default. Let's stick to hash-based routing.


// Sign out
document.getElementById('signout-btn')?.addEventListener('click', () => {
  AuthService.signOut();
  window.location.href = '/index.html';
});

// Page loader
function loadPage(page: string, query?: string) {
  const content = document.getElementById('page-content');
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');

  if (!content || !title || !subtitle) return;

  switch (page) {
    case 'overview':
      title.textContent = 'Dashboard';
      subtitle.textContent = 'Welcome back!';
      content.innerHTML = renderOverview();
      break;
    case 'appointments':
      title.textContent = 'Appointments';
      subtitle.textContent = 'Manage your scheduled visits';
      content.innerHTML = renderAppointments();
      attachAppointmentHandlers();
      break;
    case 'records':
      title.textContent = 'Medical Records';
      subtitle.textContent = 'Your medical history';
      content.innerHTML = renderRecords();
      break;
    case 'vitals':
      title.textContent = 'Vitals Tracking';
      subtitle.textContent = 'Monitor your health metrics';
      content.innerHTML = renderVitals();
      attachVitalsHandlers();
      break;
    case 'messages':
      title.textContent = 'Messages';
      subtitle.textContent = 'Chat with your doctors';
      content.innerHTML = renderMessages();
      attachMessagesHandlers();
      break;
    case 'chat':
      title.textContent = 'Chat';
      subtitle.textContent = 'Conversation with Doctor';
      content.innerHTML = renderChat(query);
      attachChatHandlers();
      break;
    case 'profile':
      title.textContent = 'Profile';
      subtitle.textContent = 'Manage your personal information';
      content.innerHTML = renderProfile();
      break;
  }
}

// Overview page
function renderOverview(): string {
  if (!currentPatient) return '';

  const appointments = DatabaseService.getAppointmentsWithDoctors(currentPatient.id);
  const upcomingAppointments = appointments.filter(a => a.date > Date.now() && a.status !== 'cancelled').sort((a, b) => a.date - b.date);
  const nextAppointment = upcomingAppointments[0];
  const records = DatabaseService.getMedicalRecordsByPatient(currentPatient.id);

  const firstName = currentPatient.name.split(' ')[0];

  return `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-300">
            Good Morning, ${firstName}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your health today.
          </p>
        </div>
        <a href="#appointments" class="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-lg hover:shadow-xl hover:scale-105">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Book Appointment
        </a>
      </div>

      <!-- Main Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Next Appointment Card -->
        <div class="col-span-full lg:col-span-2 rounded-xl border bg-white dark:bg-black border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-md transition-shadow">
          <div class="p-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Next Appointment</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Your upcoming scheduled visit</p>
          </div>
          <div class="p-6">
            ${nextAppointment ? `
              <div class="flex flex-col md:flex-row gap-6 items-start md:items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div class="flex-1 space-y-1">
                  <p class="font-semibold text-lg text-primary-600 dark:text-primary-400">
                    ${formatDate(nextAppointment.date)}
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatTime(nextAppointment.date)}
                  </p>
                </div>
                <div class="flex-1 space-y-1">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Doctor</p>
                  <p class="font-medium text-gray-900 dark:text-white">${nextAppointment.doctor?.name || 'Unknown Doctor'}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${nextAppointment.doctor?.specialty || 'Specialist'}</p>
                </div>
                <div class="flex-1 space-y-1">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Reason</p>
                  <p class="font-medium text-gray-900 dark:text-white">${nextAppointment.reason}</p>
                </div>
              </div>
            ` : `
              <div class="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div class="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">No upcoming appointments</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Schedule a check-up to stay on top of your health.</p>
                </div>
                <a href="#appointments" class="mt-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  Book Now
                </a>
              </div>
            `}
          </div>
          ${nextAppointment ? `
            <div class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3">
              <a href="#appointments" class="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                View all appointments
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </a>
            </div>
          ` : ''}
        </div>

        <!-- Quick Actions / Stats -->
        <div class="space-y-6">
          <a href="#records" class="block">
            <div class="rounded-xl border bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-600 transition-colors cursor-pointer group h-full">
              <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">Medical Records</h3>
                <svg class="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div class="p-6 pt-0">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">${records.length}</div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Access your past diagnoses and prescriptions</p>
              </div>
            </div>
          </a>

          <a href="#messages" class="block">
            <div class="rounded-xl border bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-600 transition-colors cursor-pointer group h-full">
              <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">Messages</h3>
                <svg class="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <div class="p-6 pt-0">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">Contact Doctor</div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Ask questions or request follow-ups</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `;
}

// Appointments page
function renderAppointments(): string {
  const doctors = DatabaseService.getAllDoctors();
  // distinct appointments rendering
  const myAppointments = currentPatient ? DatabaseService.getAppointmentsWithDoctors(currentPatient.id) : [];

  return `
    <div class="space-y-8">
      <!-- Your Appointments -->
      <div class="bg-white dark:bg-black p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Appointments</h3>
        
        ${myAppointments.length === 0 ? `
          <p class="text-gray-500 dark:text-gray-400 text-center py-4">No appointments scheduled.</p>
        ` : `
          <div class="grid gap-4 md:grid-cols-2">
            ${myAppointments.sort((a, b) => b.date - a.date).map(appt => `
              <div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      ${formatDate(appt.date)} at ${formatTime(appt.date)}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      with <span class="font-medium text-primary-600 dark:text-primary-400">${appt.doctor?.name}</span>
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${appt.doctor?.specialty}</p>
                  </div>
                  <span class="px-2 py-1 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
    }">
                    ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </div>
                
                <div class="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">${appt.reason}</span>
                    <a href="#chat?apptId=${appt.id}" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        Chat
                    </a>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Book New Appointment -->
      <div class="bg-white dark:bg-black p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Book New Appointment</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Select a doctor to view availability.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${doctors.map(doctor => `
            <button 
              class="doctor-card p-4 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-left bg-white dark:bg-black"
              data-doctor-id="${doctor.id}"
            >
              <div class="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3"></div>
              <h4 class="font-semibold text-gray-900 dark:text-white text-center">${doctor.name}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 text-center">${doctor.specialty}</p>
              ${doctor.bio ? `<p class="text-xs text-gray-500 dark:text-gray-500 mt-2">${doctor.bio}</p>` : ''}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Appointment Form (hidden initially) -->
      <div id="appointment-form" class="hidden bg-white dark:bg-black p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Book Appointment</h3>
        <form id="book-appointment-form" class="space-y-4">
          <input type="hidden" id="selected-doctor-id" />
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected Doctor</label>
            <p id="selected-doctor-name" class="text-gray-900 dark:text-white font-medium"></p>
          </div>

          <div>
            <label for="appointment-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              id="appointment-date"
              required
              min="${new Date().toISOString().split('T')[0]}"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>

          <div id="time-slots-container" class="hidden">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
            <div id="time-slots" class="grid grid-cols-3 md:grid-cols-4 gap-2"></div>
          </div>

          <div>
            <label for="appointment-reason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Visit</label>
            <textarea
              id="appointment-reason"
              required
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-black text-gray-900 dark:text-white"
              placeholder="Describe your symptoms or reason for visit..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Book Appointment
            </button>
            <button
              type="button"
              id="cancel-booking"
              class="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition text-gray-700 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

let selectedDoctorId: string | null = null;
let selectedTimeSlot: number | null = null;

function attachAppointmentHandlers() {
  // Doctor selection
  document.querySelectorAll('.doctor-card').forEach(card => {
    card.addEventListener('click', () => {
      const doctorId = card.getAttribute('data-doctor-id');
      if (doctorId) {
        selectDoctor(doctorId);
      }
    });
  });

  // Date change
  const dateInput = document.getElementById('appointment-date') as HTMLInputElement;
  dateInput?.addEventListener('change', () => {
    if (selectedDoctorId && dateInput.value) {
      loadTimeSlots(selectedDoctorId, dateInput.value);
    }
  });

  // Cancel booking
  document.getElementById('cancel-booking')?.addEventListener('click', () => {
    document.getElementById('appointment-form')?.classList.add('hidden');
    selectedDoctorId = null;
    selectedTimeSlot = null;
  });

  // Form submission
  const form = document.getElementById('book-appointment-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await bookAppointment();
  });
}

function selectDoctor(doctorId: string) {
  const doctor = DatabaseService.findById<Doctor>('doctors', doctorId);
  if (!doctor) return;

  selectedDoctorId = doctorId;

  const formEl = document.getElementById('appointment-form');
  const doctorNameEl = document.getElementById('selected-doctor-name');
  const doctorIdInput = document.getElementById('selected-doctor-id') as HTMLInputElement;

  if (formEl) formEl.classList.remove('hidden');
  if (doctorNameEl) doctorNameEl.textContent = `${doctor.name} - ${doctor.specialty}`;
  if (doctorIdInput) doctorIdInput.value = doctorId;

  // Highlight selected card
  document.querySelectorAll('.doctor-card').forEach(card => {
    if (card.getAttribute('data-doctor-id') === doctorId) {
      card.classList.remove('border-gray-200');
      card.classList.add('border-primary-600', 'bg-primary-50', 'ring-2', 'ring-primary-100');
    } else {
      card.classList.add('border-gray-200');
      card.classList.remove('border-primary-600', 'bg-primary-50', 'ring-2', 'ring-primary-100');
    }
  });

  // Reset time slots
  document.getElementById('time-slots-container')?.classList.add('hidden');
  selectedTimeSlot = null;
}

function loadTimeSlots(doctorId: string, dateStr: string) {
  const date = new Date(dateStr);
  const dayStart = getStartOfDay(date);
  const availableSlots = getAvailableSlots(doctorId, dayStart);

  const container = document.getElementById('time-slots-container');
  const slotsEl = document.getElementById('time-slots');

  if (!container || !slotsEl) return;

  if (availableSlots.length === 0) {
    slotsEl.innerHTML = '<p class="col-span-full text-gray-600 dark:text-gray-400 text-center py-4">No available slots for this date</p>';
    container.classList.remove('hidden');
    return;
  }

  slotsEl.innerHTML = availableSlots.map(slot => `
    <button
      type="button"
      class="time-slot-btn px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-sm font-medium text-gray-700 dark:text-gray-300"
      data-slot="${slot}"
    >
      ${formatTime(slot)}
    </button>
  `).join('');

  container.classList.remove('hidden');

  // Attach click handlers to time slots - MUST be done after adding to DOM
  const slotButtons = slotsEl.querySelectorAll('.time-slot-btn');
  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-slot');
      if (slot) {
        selectedTimeSlot = parseInt(slot);

        // Update active state
        slotButtons.forEach(b => {
          b.classList.remove('border-primary-600', 'bg-primary-100', 'dark:border-primary-500', 'dark:bg-primary-900/50');
          b.classList.add('border-gray-300', 'dark:border-gray-700');
        });
        btn.classList.remove('border-gray-300', 'dark:border-gray-700');
        btn.classList.add('border-primary-600', 'bg-primary-100', 'dark:border-primary-500', 'dark:bg-primary-900/50');
      }
    });
  });
}

function attachVitalsHandlers() {
  const form = document.getElementById('log-vitals-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await logVitals();
  });
}

function attachMessagesHandlers() {
  const form = document.getElementById('send-message-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendMessage();
  });
}

async function logVitals() {
  if (!currentPatient) return;

  const bp = (document.getElementById('vital-bp') as HTMLInputElement).value;
  const glucose = (document.getElementById('vital-glucose') as HTMLInputElement).value;
  const weight = (document.getElementById('vital-weight') as HTMLInputElement).value;
  const heartRate = (document.getElementById('vital-heart-rate') as HTMLInputElement).value;

  const now = Date.now();
  let logged = false;

  try {
    if (bp) {
      DatabaseService.createVital({
        patientId: currentPatient.id,
        date: now,
        type: 'bp',
        value: bp,
        unit: 'mmHg',
        createdAt: now,
      });
      logged = true;
    }

    if (glucose) {
      DatabaseService.createVital({
        patientId: currentPatient.id,
        date: now,
        type: 'glucose',
        value: glucose,
        unit: 'mg/dL',
        createdAt: now,
      });
      logged = true;
    }

    if (weight) {
      DatabaseService.createVital({
        patientId: currentPatient.id,
        date: now,
        type: 'weight',
        value: weight,
        unit: 'kg',
        createdAt: now,
      });
      logged = true;
    }

    if (heartRate) {
      DatabaseService.createVital({
        patientId: currentPatient.id,
        date: now,
        type: 'heart_rate',
        value: heartRate,
        unit: 'bpm',
        createdAt: now,
      });
      logged = true;
    }

    if (logged) {
      showToast('Vitals logged successfully!', 'success');
      // Reload vitals page
      setTimeout(() => {
        loadPage('vitals');
        // Update nav
        navLinks.forEach(l => {
          l.classList.remove('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
          l.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        });
        document.querySelector('a[href="#vitals"]')?.classList.add('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
        document.querySelector('a[href="#vitals"]')?.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
      }, 500);
    } else {
      showToast('Please enter at least one vital sign', 'error');
    }
  } catch (error) {
    showToast('Failed to log vitals', 'error');
  }
}



async function sendMessage() {
  if (!currentPatient) return;

  const input = document.getElementById('message-input') as HTMLInputElement;
  const messageBody = input.value.trim();

  if (!messageBody) return;

  // Global message sending is disabled as it requires a specific doctor context.
  // We direct the user to the chat view which handles this.
  showToast('Please go to Appointments -> Chat to send a message to a specific doctor.', 'info');
  input.value = '';
}

async function bookAppointment() {
  if (!currentPatient) {
    showToast('Please complete your patient profile first', 'error');
    return;
  }
  
  if (!selectedDoctorId || selectedTimeSlot === null) {
    showToast('Please select a doctor, date, and time slot', 'error');
    return;
  }

  const reason = (document.getElementById('appointment-reason') as HTMLTextAreaElement).value;

  // Check for conflicts
  const conflict = checkConflict(selectedDoctorId, selectedTimeSlot);
  if (conflict.hasConflict) {
    showToast('This time slot is no longer available', 'error');
    return;
  }

  try {
    DatabaseService.createAppointment({
      patientId: currentPatient.id,
      doctorId: selectedDoctorId,
      date: selectedTimeSlot,
      status: 'pending',
      reason,
      createdAt: Date.now(),
    });

    showToast('Appointment booked successfully!', 'success');

    // Reset and go back to overview
    setTimeout(() => {
      loadPage('overview');
      // Update nav
      navLinks.forEach(l => {
        l.classList.remove('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
        l.classList.add('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
      });
      document.querySelector('a[href="#overview"]')?.classList.add('active', 'bg-primary-50', 'dark:bg-primary-900/20', 'text-primary-600', 'dark:text-primary-400');
      document.querySelector('a[href="#overview"]')?.classList.remove('text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
    }, 1000);
  } catch (error) {
    showToast('Failed to book appointment', 'error');
  }
}

// Placeholder render functions
function renderRecords(): string {
  if (!currentPatient) return '';

  const records = DatabaseService.getMedicalRecordsByPatient(currentPatient.id);
  const sortedRecords = records.sort((a, b) => b.date - a.date);

  return `
    <div class="space-y-6">
      ${sortedRecords.length === 0 ? `
        <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <p class="text-gray-600 text-center">No medical records yet</p>
        </div>
      ` : `
        ${sortedRecords.map(record => {
    const doctor = DatabaseService.findById<Doctor>('doctors', record.doctorId);

    return `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">${formatDate(record.date)}</h3>
                  <p class="text-sm text-gray-600">Dr. ${doctor?.name || 'Unknown'} - ${doctor?.specialty || ''}</p>
                </div>
                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Completed
                </span>
              </div>

              <div class="space-y-3">
                ${record.symptoms ? `
                  <div>
                    <p class="text-sm font-medium text-gray-700">Symptoms</p>
                    <p class="text-gray-900">${record.symptoms}</p>
                  </div>
                ` : ''}

                ${record.diagnosis ? `
                  <div>
                    <p class="text-sm font-medium text-gray-700">Diagnosis</p>
                    <p class="text-gray-900">${record.diagnosis}</p>
                  </div>
                ` : ''}

                ${record.prescription && record.prescription.length > 0 ? `
                  <div>
                    <p class="text-sm font-medium text-gray-700 mb-2">Prescription</p>
                    <div class="space-y-2">
                      ${record.prescription.map(med => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p class="font-medium text-gray-900">${med.medicine}</p>
                            <p class="text-sm text-gray-600">${med.dosage}</p>
                            ${med.instructions ? `<p class="text-xs text-gray-500">${med.instructions}</p>` : ''}
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${record.notes ? `
                  <div>
                    <p class="text-sm font-medium text-gray-700">Notes</p>
                    <p class="text-gray-900">${record.notes}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
  }).join('')}
      `}
    </div>
  `;
}

function renderVitals(): string {
  if (!currentPatient) return '';

  const vitals = DatabaseService.getVitalsByPatient(currentPatient.id);
  const sortedVitals = vitals.sort((a, b) => b.date - a.date);

  return `
    <div class="space-y-6">
      <!-- Log Vitals Form -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Log New Vitals</h3>
        <form id="log-vitals-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Blood Pressure -->
          <div>
            <label for="vital-bp" class="block text-sm font-medium text-gray-700 mb-1">
              Blood Pressure (mmHg)
            </label>
            <input
              type="text"
              id="vital-bp"
              placeholder="120/80"
              pattern="\\d{2,3}/\\d{2,3}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">Format: systolic/diastolic</p>
          </div>

          <!-- Blood Glucose -->
          <div>
            <label for="vital-glucose" class="block text-sm font-medium text-gray-700 mb-1">
              Blood Glucose (mg/dL)
            </label>
            <input
              type="number"
              id="vital-glucose"
              placeholder="100"
              min="0"
              max="600"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Weight -->
          <div>
            <label for="vital-weight" class="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              id="vital-weight"
              placeholder="70"
              min="0"
              max="500"
              step="0.1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Heart Rate -->
          <div>
            <label for="vital-heart-rate" class="block text-sm font-medium text-gray-700 mb-1">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              id="vital-heart-rate"
              placeholder="72"
              min="0"
              max="300"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div class="md:col-span-2">
            <button
              type="submit"
              class="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Log Vitals
            </button>
          </div>
        </form>
      </div>

      <!-- Vitals History -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Vitals History</h3>
        ${sortedVitals.length === 0 ? `
          <p class="text-gray-600 text-center py-8">No vitals logged yet</p>
        ` : `
          <div class="space-y-3">
            ${sortedVitals.map(vital => {
    const typeLabels: Record<string, string> = {
      bp: 'Blood Pressure',
      glucose: 'Blood Glucose',
      weight: 'Weight',
      heart_rate: 'Heart Rate'
    };

    return `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 ${vital.type === 'bp' ? 'bg-red-100' :
        vital.type === 'glucose' ? 'bg-yellow-100' :
          vital.type === 'weight' ? 'bg-blue-100' :
            'bg-purple-100'
      } rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 ${vital.type === 'bp' ? 'text-red-600' :
        vital.type === 'glucose' ? 'text-yellow-600' :
          vital.type === 'weight' ? 'text-blue-600' :
            'text-purple-600'
      }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">${typeLabels[vital.type]}</p>
                      <p class="text-sm text-gray-600">${vital.value} ${vital.unit}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">${formatDate(vital.date)}</p>
                    <p class="text-sm text-gray-600">${formatTime(vital.date)}</p>
                  </div>
                </div>
              `;
  }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderMessages(): string {
  if (!currentPatient) return '';

  const messages = DatabaseService.getMessagesByPatient(currentPatient.id);
  const sortedMessages = messages.sort((a, b) => a.createdAt - b.createdAt);

  return `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Messages Header -->
        <div class="bg-primary-50 dark:bg-primary-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Messages</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Communicate with your healthcare providers</p>
        </div>

        <!-- Messages List -->
        <div class="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-black">
          ${sortedMessages.length === 0 ? `
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <p class="text-gray-600 dark:text-gray-400">No messages yet</p>
              <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Start a conversation with your doctor</p>
            </div>
          ` : sortedMessages.map(msg => {
    const isFromPatient = msg.role === 'patient';
    return `
              <div class="flex ${isFromPatient ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs lg:max-w-md">
                  <div class="flex items-center gap-2 mb-1 ${isFromPatient ? 'flex-row-reverse' : ''}">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${msg.senderName}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-500">${formatTime(msg.createdAt)}</span>
                  </div>
                  <div class="px-4 py-2 rounded-lg ${isFromPatient
        ? 'bg-primary-600 text-white'
        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
      }">
                    <p class="text-sm">${msg.body}</p>
                  </div>
                </div>
              </div>
            `;
  }).join('')}
        </div>

        <!-- Message Input -->
        <div class="bg-white dark:bg-black px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <form id="send-message-form" class="flex gap-3">
            <input
              type="text"
              id="message-input"
              placeholder="Type your message..."
              required
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function renderProfile(): string {
  if (!currentPatient) return '';

  return `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Header -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${currentPatient.name}</h3>
            <p class="text-gray-600 dark:text-gray-400">${currentPatient.email}</p>
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.name}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.email}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.phone}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.dob}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <p class="text-gray-900 dark:text-white capitalize">${currentPatient.gender}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.bloodGroup}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.address}</p>
          </div>
        </div>
      </div>

      <!-- Medical Information -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medical Information</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.allergies || 'None reported'}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chronic Conditions</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.chronicConditions || 'None reported'}</p>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.emergencyContactName}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.emergencyContactRelation}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <p class="text-gray-900 dark:text-white">${currentPatient.emergencyContactPhone}</p>
          </div>
        </div>
      </div>

      <!-- Note about editing -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-900 dark:text-blue-200">Profile Editing</p>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">To update your profile information, please contact the administrator or your healthcare provider.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Registration Form State
let registrationStep = 1;
const registrationData: Partial<Patient> = {};

function showRegistrationForm(): void {
  const content = document.getElementById('page-content');
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');

  if (title) title.textContent = 'Complete Your Profile';
  if (subtitle) subtitle.textContent = 'Please provide your information to continue';

  if (!content) return;

  renderRegistrationStep();
}

function renderRegistrationStep() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const steps = [
    { id: 1, title: "Personal Details", icon: "User" },
    { id: 2, title: "Medical Info", icon: "FileHeart" },
    { id: 3, title: "Emergency Contact", icon: "Phone" },
    { id: 4, title: "Review & Verify", icon: "CheckCircle2" },
  ];

  const progress = (registrationStep / steps.length) * 100;

  let stepContent = '';

  switch (registrationStep) {
    case 1:
      stepContent = `
        <div class="space-y-4 animate-slide-up">
          <div class="space-y-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
             <input type="text" id="reg-name" value="${registrationData.name || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe">
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
               <input type="email" id="reg-email" value="${registrationData.email || session.email || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-primary-500 outline-none cursor-not-allowed" readonly>
             </div>
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
               <input type="tel" id="reg-phone" value="${registrationData.phone || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="+1 234 567 890">
             </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
               <input type="date" id="reg-dob" value="${registrationData.dob || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
             </div>
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
               <div class="relative">
                 <select id="reg-gender" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
                   <option value="" disabled ${!registrationData.gender ? 'selected' : ''}>Select gender</option>
                   <option value="male" ${registrationData.gender === 'male' ? 'selected' : ''}>Male</option>
                   <option value="female" ${registrationData.gender === 'female' ? 'selected' : ''}>Female</option>
                   <option value="other" ${registrationData.gender === 'other' ? 'selected' : ''}>Other</option>
                 </select>
                 <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
               </div>
             </div>
          </div>

          <div class="space-y-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
             <textarea id="reg-address" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="123 Main St, City, Country">${registrationData.address || ''}</textarea>
          </div>
        </div>
      `;
      break;
    case 2:
      stepContent = `
        <div class="space-y-4 animate-slide-up">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
            <div class="relative">
              <select id="reg-blood-group" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
                <option value="" disabled ${!registrationData.bloodGroup ? 'selected' : ''}>Select blood group</option>
                ${["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => `
                  <option value="${bg}" ${registrationData.bloodGroup === bg ? 'selected' : ''}>${bg}</option>
                `).join('')}
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div class="space-y-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Allergies (Optional)</label>
             <textarea id="reg-allergies" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Peanuts, Penicillin, etc.">${registrationData.allergies || ''}</textarea>
          </div>

          <div class="space-y-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Chronic Conditions (Optional)</label>
             <textarea id="reg-conditions" rows="3" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Diabetes, Hypertension, etc.">${registrationData.chronicConditions || ''}</textarea>
          </div>
        </div>
      `;
      break;
    case 3:
      stepContent = `
        <div class="space-y-4 animate-slide-up">
          <div class="space-y-1">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Name</label>
             <input type="text" id="reg-ec-name" value="${registrationData.emergencyContactName || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Jane Doe">
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
               <input type="text" id="reg-ec-relation" value="${registrationData.emergencyContactRelation || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Spouse, Parent, etc.">
             </div>
             <div class="space-y-1">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
               <input type="tel" id="reg-ec-phone" value="${registrationData.emergencyContactPhone || ''}" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="+1 234 567 890">
             </div>
          </div>
        </div>
      `;
      break;
    case 4:
      stepContent = `
        <div class="space-y-6 animate-slide-up">
           <!-- Personal Details Review -->
           <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
              <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Personal Details</h3>
                  <button type="button" class="text-xs text-primary-600 dark:text-primary-400 hover:underline" onclick="jumpToStep(1)">Edit</button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Name:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.name}</span>
                  <span class="text-gray-500 dark:text-gray-400">Email:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.email || session.email}</span>
                  <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.phone}</span>
                  <span class="text-gray-500 dark:text-gray-400">DOB:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.dob}</span>
                  <span class="text-gray-500 dark:text-gray-400">Gender:</span>
                  <span class="text-gray-900 dark:text-white capitalize">${registrationData.gender}</span>
                  <span class="text-gray-500 dark:text-gray-400">Address:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.address}</span>
              </div>
           </div>

           <!-- Medical Info Review -->
           <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
              <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Medical Info</h3>
                  <button type="button" class="text-xs text-primary-600 dark:text-primary-400 hover:underline" onclick="jumpToStep(2)">Edit</button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Blood Group:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.bloodGroup}</span>
                  <span class="text-gray-500 dark:text-gray-400">Allergies:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.allergies || "None"}</span>
                  <span class="text-gray-500 dark:text-gray-400">Conditions:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.chronicConditions || "None"}</span>
              </div>
           </div>

           <!-- Emergency Contact Review -->
           <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
              <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
                  <button type="button" class="text-xs text-primary-600 dark:text-primary-400 hover:underline" onclick="jumpToStep(3)">Edit</button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Name:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.emergencyContactName}</span>
                  <span class="text-gray-500 dark:text-gray-400">Relation:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.emergencyContactRelation}</span>
                  <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                  <span class="text-gray-900 dark:text-white">${registrationData.emergencyContactPhone}</span>
              </div>
           </div>
        </div>
      `;
      break;
  }

  content.innerHTML = `
    <div class="max-w-2xl mx-auto">
      <!-- Steps Indicator -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          ${steps.map(s => `
            <div class="flex flex-col items-center ${s.id <= registrationStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}">
               <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${s.id <= registrationStep ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700'
    }">
                 <span class="font-semibold text-sm">${s.id}</span>
               </div>
               <span class="text-xs font-medium hidden sm:block">${s.title}</span>
            </div>
          `).join('')}
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div class="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
        </div>
      </div>

      <div class="bg-white dark:bg-black p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
         <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">${steps[registrationStep - 1].title}</h2>
         
         <form id="registration-form">
           ${stepContent}

           <div class="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
             ${registrationStep > 1 ? `
               <button type="button" id="prev-step-btn" class="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                 Previous
               </button>
             ` : '<div></div>'}
             
             ${registrationStep < 4 ? `
               <button type="button" id="next-step-btn" class="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-md hover:shadow-lg">
                 Next Step
               </button>
             ` : `
               <button type="submit" class="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-md hover:shadow-lg flex items-center gap-2">
                 Submit Registration
               </button>
             `}
           </div>
         </form>
      </div>
    </div>
  `;

  // Attach handlers
  document.getElementById('prev-step-btn')?.addEventListener('click', handlePrevStep);
  document.getElementById('next-step-btn')?.addEventListener('click', handleNextStep);
  document.getElementById('registration-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitRegistration();
  });

  // Expose jumpToStep to window for onclick handlers in template strings
  (window as any).jumpToStep = (step: number) => {
    registrationStep = step;
    renderRegistrationStep();
  };
}

function handlePrevStep() {
  if (registrationStep > 1) {
    registrationStep--;
    renderRegistrationStep();
  }
}

function handleNextStep() {
  // Validate current step
  const isValid = validateStep(registrationStep);
  if (!isValid) return;

  // Save current step data
  saveStepData(registrationStep);

  // Move to next step
  if (registrationStep < 4) {
    registrationStep++;
    renderRegistrationStep();
  }
}

function saveStepData(step: number) {
  if (step === 1) {
    registrationData.name = (document.getElementById('reg-name') as HTMLInputElement).value;
    registrationData.email = session.email; // Ensure email is captured
    registrationData.phone = (document.getElementById('reg-phone') as HTMLInputElement).value;
    registrationData.dob = (document.getElementById('reg-dob') as HTMLInputElement).value;
    registrationData.gender = (document.getElementById('reg-gender') as HTMLSelectElement).value as any;
    registrationData.address = (document.getElementById('reg-address') as HTMLTextAreaElement).value;
  } else if (step === 2) {
    registrationData.bloodGroup = (document.getElementById('reg-blood-group') as HTMLSelectElement).value;
    registrationData.allergies = (document.getElementById('reg-allergies') as HTMLTextAreaElement).value;
    registrationData.chronicConditions = (document.getElementById('reg-conditions') as HTMLTextAreaElement).value;
  } else if (step === 3) {
    registrationData.emergencyContactName = (document.getElementById('reg-ec-name') as HTMLInputElement).value;
    registrationData.emergencyContactRelation = (document.getElementById('reg-ec-relation') as HTMLInputElement).value;
    registrationData.emergencyContactPhone = (document.getElementById('reg-ec-phone') as HTMLInputElement).value;
  }
}

function validateStep(step: number): boolean {
  let isValid = true;

  if (step === 1) {
    const name = (document.getElementById('reg-name') as HTMLInputElement).value;
    const phone = (document.getElementById('reg-phone') as HTMLInputElement).value;
    const dob = (document.getElementById('reg-dob') as HTMLInputElement).value;
    const gender = (document.getElementById('reg-gender') as HTMLSelectElement).value;
    const address = (document.getElementById('reg-address') as HTMLTextAreaElement).value;

    if (!name || name.length < 2) {
      showToast('Please enter a valid name', 'error');
      isValid = false;
    } else if (!phone || phone.length < 10) {
      showToast('Please enter a valid phone number', 'error');
      isValid = false;
    } else if (!dob) {
      showToast('Please enter your date of birth', 'error');
      isValid = false;
    } else if (new Date(dob) >= new Date()) {
      showToast('Date of birth must be in the past', 'error');
      isValid = false;
    } else if (!gender) {
      showToast('Please select your gender', 'error');
      isValid = false;
    } else if (!address || address.length < 5) {
      showToast('Please enter a valid address', 'error');
      isValid = false;
    }
  } else if (step === 2) {
    const bloodGroup = (document.getElementById('reg-blood-group') as HTMLSelectElement).value;
    if (!bloodGroup) {
      showToast('Please select your blood group', 'error');
      isValid = false;
    }
  } else if (step === 3) {
    const ecName = (document.getElementById('reg-ec-name') as HTMLInputElement).value;
    const ecRelation = (document.getElementById('reg-ec-relation') as HTMLInputElement).value;
    const ecPhone = (document.getElementById('reg-ec-phone') as HTMLInputElement).value;

    if (!ecName || ecName.length < 2) {
      showToast('Please enter emergency contact name', 'error');
      isValid = false;
    } else if (!ecRelation || ecRelation.length < 2) {
      showToast('Please enter relationship', 'error');
      isValid = false;
    } else if (!ecPhone || ecPhone.length < 10) {
      showToast('Please enter emergency contact phone', 'error');
      isValid = false;
    }
  }

  return isValid;
}

async function submitRegistration() {
  try {
    const now = Date.now();
    const newPatient: Omit<Patient, 'id'> = {
      userId: session.userId,
      name: registrationData.name!,
      email: session.email,
      phone: registrationData.phone!,
      dob: registrationData.dob!,
      gender: registrationData.gender as any,
      address: registrationData.address!,
      bloodGroup: registrationData.bloodGroup!,
      allergies: registrationData.allergies,
      chronicConditions: registrationData.chronicConditions,
      emergencyContactName: registrationData.emergencyContactName!,
      emergencyContactRelation: registrationData.emergencyContactRelation!,
      emergencyContactPhone: registrationData.emergencyContactPhone!,
      createdAt: now,
    };

    DatabaseService.createPatient(newPatient);

    showToast('Registration successful!', 'success');

    // Refresh page to show dashboard
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    console.error(error);
    showToast('Failed to register. Please try again.', 'error');
  }
}

function renderChat(query?: string): string {
  const params = new URLSearchParams(query);
  const apptId = params.get('apptId');
  let doctor: Doctor | null = null;

  if (apptId) {
    const appt = DatabaseService.findById<Appointment>('appointments', apptId);
    if (appt) {
      doctor = DatabaseService.findById<Doctor>('doctors', appt.doctorId);
    }
  }

  // If no doctor found (e.g. direct link without appt), maybe handle gracefully?
  // For now, we assume entry via appointment.

  const messages = doctor
    ? DatabaseService.getMessagesBetween(currentPatient!.id, doctor.id)
    : [];

  return `
    <div class="flex flex-col h-[600px] bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex items-center gap-3">
             <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                ${doctor ? doctor.name.charAt(0) : 'D'}
            </div>
            <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">${doctor ? doctor.name : 'Select an appointment to chat'}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">${doctor ? doctor.specialty : ''}</p>
            </div>
        </div>

        <!-- Messages Area -->
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black">
            ${messages.length === 0 ? `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No messages yet.</p>
                    <p class="text-sm">Start the conversation below.</p>
                </div>
            ` : messages.sort((a, b) => a.createdAt - b.createdAt).map(msg => `
                <div class="flex ${msg.role === 'patient' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[70%] rounded-2xl px-4 py-2 ${msg.role === 'patient'
      ? 'bg-primary-600 text-white rounded-br-none'
      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
    }">
                        <p class="text-sm">${msg.body}</p>
                        <p class="text-[10px] mt-1 opacity-70 ${msg.role === 'patient' ? 'text-primary-100' : 'text-gray-500'}">
                            ${formatTime(msg.createdAt)}
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <form id="chat-form" class="flex gap-2">
                <input type="hidden" id="chat-doctor-id" value="${doctor?.id || ''}">
                <input 
                    type="text" 
                    id="message-input" 
                    placeholder="Type your message..." 
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-900 dark:text-white"
                    required
                    ${!doctor ? 'disabled' : ''}
                >
                <button 
                    type="submit" 
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    ${!doctor ? 'disabled' : ''}
                >
                    <span>Send</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    </div>
    `;
}

function attachChatHandlers() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input') as HTMLInputElement;
  const doctorIdInput = document.getElementById('chat-doctor-id') as HTMLInputElement;
  const messagesContainer = document.getElementById('chat-messages');

  // Scroll to bottom
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = input.value.trim();
    const doctorId = doctorIdInput?.value;

    if (!body || !doctorId) return;

    // Create message
    DatabaseService.createMessage({
      patientId: currentPatient!.id,
      doctorId: doctorId,
      senderId: session.userId,
      senderName: currentPatient!.name,
      role: 'patient',
      body: body,
      isRead: false,
      createdAt: Date.now()
    });

    // Clear input
    input.value = '';

    // Refresh view (simple reload for now)
    // Better: append message to DOM directly
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
    if (messagesContainer) {
      messagesContainer.insertAdjacentHTML('beforeend', newMsgHtml);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

// Initialize on load
init();
