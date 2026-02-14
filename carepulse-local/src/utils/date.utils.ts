import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: number, formatStr: string = 'MMM dd, yyyy'): string {
    return format(timestamp, formatStr);
}

/**
 * Format a timestamp to a time string
 */
export function formatTime(timestamp: number): string {
    return format(timestamp, 'h:mm a');
}

/**
 * Format a timestamp to date and time
 */
export function formatDateTime(timestamp: number): string {
    return format(timestamp, 'MMM dd, yyyy h:mm a');
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
    return formatDistanceToNow(timestamp, { addSuffix: true });
}

/**
 * Get a friendly date label
 */
export function getFriendlyDate(timestamp: number): string {
    if (isToday(timestamp)) {
        return `Today at ${formatTime(timestamp)}`;
    }
    if (isTomorrow(timestamp)) {
        return `Tomorrow at ${formatTime(timestamp)}`;
    }
    return formatDateTime(timestamp);
}

/**
 * Check if a date is in the past
 */
export function isDatePast(timestamp: number): boolean {
    return isPast(timestamp);
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(date: Date = new Date()): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
