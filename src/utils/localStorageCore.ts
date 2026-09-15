export const storageCore = {
    get: <T>(key: string, fallback: T | null = null): T | null => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) as T : fallback;
        } catch (error) {
            console.warn(`Lỗi parse localStorage key "${key}":`, error);
            return fallback;
        }
    },
    set: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Lỗi lưu localStorage key "${key}":`, error);
        }
    },
    remove: (key: string): void => {
        localStorage.removeItem(key);
    }
};