// LocalStorage wrapper with error handling

const STORAGE_PREFIX = 'carepulse:';

export class StorageService {
    private static getKey(key: string): string {
        return `${STORAGE_PREFIX}${key}`;
    }

    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return null;
        }
    }

    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(this.getKey(key), JSON.stringify(value));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded!');
                alert('Storage limit reached. Please clear some data.');
            } else {
                console.error(`Error writing to localStorage (${key}):`, error);
            }
        }
    }

    static remove(key: string): void {
        try {
            localStorage.removeItem(this.getKey(key));
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
        }
    }

    static clear(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    static exists(key: string): boolean {
        return localStorage.getItem(this.getKey(key)) !== null;
    }
}
