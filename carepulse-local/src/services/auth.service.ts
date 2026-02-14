import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { StorageService } from './storage.service';
import type { User, Session } from '../models/types';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
    private static USERS_KEY = 'users';
    private static SESSION_KEY = 'session';

    static async signUp(email: string, password: string, role: 'patient' | 'doctor' | 'admin'): Promise<User> {
        const users = StorageService.get<User[]>(this.USERS_KEY) || [];

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: User = {
            id: uuidv4(),
            email,
            password: hashedPassword,
            role,
            createdAt: Date.now(),
        };

        users.push(newUser);
        StorageService.set(this.USERS_KEY, users);

        // Create session automatically after signup
        const session: Session = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            expiresAt: Date.now() + SESSION_DURATION,
        };

        StorageService.set(this.SESSION_KEY, session);

        return newUser;
    }

    static async signIn(email: string, password: string): Promise<User> {
        const users = StorageService.get<User[]>(this.USERS_KEY) || [];
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Create session
        const session: Session = {
            userId: user.id,
            email: user.email,
            role: user.role,
            expiresAt: Date.now() + SESSION_DURATION,
        };

        StorageService.set(this.SESSION_KEY, session);

        return user;
    }

    static signOut(): void {
        StorageService.remove(this.SESSION_KEY);
    }

    static getCurrentUser(): User | null {
        const session = StorageService.get<Session>(this.SESSION_KEY);

        if (!session) {
            return null;
        }

        // Check if session expired
        if (Date.now() > session.expiresAt) {
            this.signOut();
            return null;
        }

        const users = StorageService.get<User[]>(this.USERS_KEY) || [];
        return users.find(u => u.id === session.userId) || null;
    }

    static getSession(): Session | null {
        const session = StorageService.get<Session>(this.SESSION_KEY);

        if (!session || Date.now() > session.expiresAt) {
            return null;
        }

        return session;
    }

    static isAuthenticated(): boolean {
        return this.getSession() !== null;
    }

    static requireAuth(requiredRole?: 'patient' | 'doctor' | 'admin'): void {
        const session = this.getSession();

        if (!session) {
            window.location.href = '/index.html';
            throw new Error('Authentication required');
        }

        if (requiredRole && session.role !== requiredRole) {
            throw new Error('Insufficient permissions');
        }
    }
}
