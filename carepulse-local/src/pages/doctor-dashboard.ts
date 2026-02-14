import { DatabaseService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { formatDate, formatTime, getStartOfDay } from '../utils/date.utils';
import type { Doctor, Patient, Message } from '../models/types';
import '../utils/theme.utils';

const session = AuthService.getSession()!;
let currentDoctor: Doctor | null = null;
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('page-title')!;
const pageSubtitle = document.getElementById('page-subtitle')!;
const content = document.getElementById('page-content')!;
const userName = document.getElementById('user-name')!;

// Initialize Dashboard
async function initDashboard() {
    if (!session || session.role !== 'doctor') {
        window.location.href = '/auth.html';
        return;
    }

    // Get doctor details
    const doctors = DatabaseService.getDoctors();
    currentDoctor = doctors.find(d => d.userId === session.userId) || null;

    if (!currentDoctor) {
        AuthService.signOut();
        return;
    }

    userName.textContent = `Dr. ${currentDoctor.name}`;

    // Handle navigation
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Initial load

    // Sign out handler
    document.getElementById('signout-btn')?.addEventListener('click', () => {
        AuthService.signOut();
    });
}

function handleNavigation() {
    const hashString = window.location.hash.slice(1) || 'overview';
    const [page, query] = hashString.split('?');

    // Update active state
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${page}`) {
            link.classList.add('active', 'bg-primary-50', 'text-primary-600');
            link.classList.remove('text-gray-700', 'hover:bg-gray-100');
        } else {
            link.classList.remove('active', 'bg-primary-50', 'text-primary-600');
            link.classList.add('text-gray-700', 'hover:bg-gray-100');
        }
    });

    loadPage(page, query);
}

function loadPage(page: string, query?: string) {
    switch (page) {
        case 'overview':
            pageTitle.textContent = 'Dashboard Overview';
            pageSubtitle.textContent = `Welcome back, Dr. ${currentDoctor?.name}`;
            content.innerHTML = renderOverview();
            break;
        case 'appointments':
            pageTitle.textContent = 'Appointments';
            pageSubtitle.textContent = 'Manage your schedule';
            content.innerHTML = renderAppointments();
            attachAppointmentHandlers();
            break;
        case 'patients':
            pageTitle.textContent = 'My Patients';
            pageSubtitle.textContent = 'View patient records';
            content.innerHTML = renderPatients();
            break;
        case 'messages':
            pageTitle.textContent = 'Messages';
            pageSubtitle.textContent = 'Patient comms';
            content.innerHTML = renderMessages(query);
            attachMessageHandlers();
            break;
        case 'profile':
            pageTitle.textContent = 'Profile';
            pageSubtitle.textContent = 'Your information';
            content.innerHTML = renderProfile();
            break;
        default:
            loadPage('overview');
    }
}

function renderOverview(): string {
    if (!currentDoctor) return '';

    const appointments = DatabaseService.getAppointmentsByDoctor(currentDoctor.id);
    const today = getStartOfDay(new Date());
    const nextDay = today + 24 * 60 * 60 * 1000;

    const todayAppointments = appointments.filter(a => a.date >= today && a.date < nextDay);
    const pendingAppointments = appointments.filter(a => a.status === 'pending');
    const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

    return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Today's Appointments -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span class="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Today</span>
        </div>
        <h3 class="text-3xl font-bold mb-1">${todayAppointments.length}</h3>
        <p class="text-blue-100">Appointments Today</p>
      </div>

      <!-- Pending Requests -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Pending</span>
        </div>
        <h3 class="text-3xl font-bold mb-1">${pendingAppointments.length}</h3>
        <p class="text-purple-100">Pending Requests</p>
      </div>

      <!-- Total Patients -->
      <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <span class="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
        </div>
        <h3 class="text-3xl font-bold mb-1">${uniquePatients}</h3>
        <p class="text-teal-100">Unique Patients</p>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Today's Schedule</h3>
        <button onclick="window.location.hash='appointments'" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">View All</button>
      </div>
      <div class="p-6">
        ${todayAppointments.length === 0 ? `
          <div class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No appointments scheduled for today</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${todayAppointments.sort((a, b) => a.date - b.date).map(appt => {
        const patient = DatabaseService.findById<Patient>('patients', appt.patientId);
        return `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                      ${patient?.name.charAt(0) || '?'}
                    </div>
                    <div>
                      <p class="font-bold text-gray-900 dark:text-white">${patient?.name || 'Unknown Patient'}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">${formatTime(appt.date)} • ${appt.reason}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <a href="#messages?patientId=${appt.patientId}" class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Chat with Patient">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </a>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
            }">
                    ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
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

function renderAppointments(): string {
    if (!currentDoctor) return '';
    const appointments = DatabaseService.getAppointmentsByDoctor(currentDoctor.id);

    return `
    <div class="space-y-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Patient</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date & Time</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Reason</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            <th class="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                        ${appointments.length === 0 ? `
                            <tr>
                                <td colspan="5" class="px-6 py-8 text-center text-gray-500">No appointments found</td>
                            </tr>
                        ` : appointments.sort((a, b) => b.date - a.date).map(appt => {
        const patient = DatabaseService.findById<Patient>('patients', appt.patientId);
        return `
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-gray-900 dark:text-white">${patient?.name || 'Unknown'}</div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        ${formatDate(appt.date)}<br>
                                        ${formatTime(appt.date)}
                                    </td>
                                    <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${appt.reason}</td>
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
                                                <button class="text-green-600 hover:text-green-800 font-medium btn-confirm" data-id="${appt.id}">Confirm</button>
                                                <button class="text-red-600 hover:text-red-800 font-medium btn-cancel" data-id="${appt.id}">Cancel</button>
                                            ` : ''}
                                            ${appt.status === 'confirmed' ? `
                                                <button class="text-blue-600 hover:text-blue-800 font-medium btn-complete" data-id="${appt.id}">Complete</button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  `;
}

function attachAppointmentHandlers() {
    document.querySelectorAll('.btn-confirm').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.target as HTMLElement).dataset.id!;
            if (confirm('Are you sure you want to confirm this appointment?')) {
                await updateAppointmentStatus(id, 'confirmed');
            }
        });
    });

    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.target as HTMLElement).dataset.id!;
            if (confirm('Are you sure you want to cancel this appointment?')) {
                await updateAppointmentStatus(id, 'cancelled');
            }
        });
    });

    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = (e.target as HTMLElement).dataset.id!;
            if (confirm('Mark this appointment as completed?')) {
                await updateAppointmentStatus(id, 'completed');
            }
        });
    });
}

async function updateAppointmentStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
    DatabaseService.updateAppointment(id, { status });
    loadPage('appointments'); // Reload to show changes
}

function renderPatients(): string {
    if (!currentDoctor) return '';
    // For demo: show all patients. In real app: show only assigned.
    // We can filter by those who have appointment with me.
    const myAppts = DatabaseService.getAppointmentsByDoctor(currentDoctor.id);
    const myPatientIds = new Set(myAppts.map(a => a.patientId));
    const patients = DatabaseService.getPatients().filter(p => myPatientIds.has(p.id));

    if (patients.length === 0) {
        return `
        <div class="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <p class="text-gray-500">No patients associated with you yet.</p>
        </div>
      `;
    }

    return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${patients.map(p => `
            <div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
                <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 text-2xl font-bold flex-shrink-0">
                    ${p.name.charAt(0)}
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">${p.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">${p.gender} • ${p.dob}</p>
                    <div class="space-y-1 text-sm">
                        <p class="text-gray-600 dark:text-gray-400">📧 ${p.email}</p>
                        <p class="text-gray-600 dark:text-gray-400">📱 ${p.phone}</p>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
  `;
}

function renderMessages(query?: string): string {
    if (!currentDoctor) return '';

    const params = new URLSearchParams(query);
    const selectedPatientId = params.get('patientId');

    // Get all messages for this doctor
    const allMessages = DatabaseService.getMessagesByDoctor(currentDoctor.id);

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
                ${selectedPatientId ? renderChatArea(selectedPatientId) : `
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

function renderChatArea(patientId: string): string {
    if (!currentDoctor) return '';
    const patient = DatabaseService.findById<Patient>('patients', patientId);
    if (!patient) return 'Patient not found';

    const messages = DatabaseService.getMessagesBetween(patientId, currentDoctor.id);

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

        if (!body || !patientId || !currentDoctor) return;

        DatabaseService.createMessage({
            patientId: patientId,
            doctorId: currentDoctor.id,  // Sender is doctor
            senderId: session.userId,
            senderName: currentDoctor.name,
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

function renderProfile(): string {
    if (!currentDoctor) return '';
    return `
        <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="p-8">
                <div class="flex items-center gap-6 mb-8">
                    <div class="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 text-4xl font-bold">
                        ${currentDoctor.name.charAt(0)}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Dr. ${currentDoctor.name}</h2>
                        <p class="text-lg text-primary-600 dark:text-primary-400">${currentDoctor.specialty}</p>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">About</h3>
                        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">${currentDoctor.bio || 'No bio available.'}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Contact Information</h3>
                            <div class="space-y-2">
                                <p class="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span class="w-5 text-gray-400">✉️</span> ${currentDoctor.email}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Account Status</h3>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ${currentDoctor.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


initDashboard();
