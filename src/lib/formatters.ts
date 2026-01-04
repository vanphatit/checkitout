/**
 * Format duration from minutes to readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30m"
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins}m`;
    }

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

/**
 * Format price to Vietnamese currency
 * @param price - Price in VND
 * @returns Formatted string like "150,000đ"
 */
export function formatPrice(price: number): string {
    return price.toLocaleString("vi-VN") + "đ";
}

/**
 * Format date to Vietnamese format
 * @param date - Date string or Date object
 * @returns Formatted string like "04/01/2026"
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("vi-VN");
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date string
 */
export function getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
