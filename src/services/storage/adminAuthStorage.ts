import { storageCore } from '../../utils/localStorageCore';
import { ADMIN_STORAGE_KEYS } from '../../constants/adminStorageKeys';

export const adminAuthStorage = {
    getUser: () => storageCore.get<any>(ADMIN_STORAGE_KEYS.ADMIN_USER),
    setUser: (user: any) => storageCore.set(ADMIN_STORAGE_KEYS.ADMIN_USER, user),
    removeUser: () => storageCore.remove(ADMIN_STORAGE_KEYS.ADMIN_USER),
    updateUser: (newData: Partial<any>) => {
        const currentUser = adminAuthStorage.getUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...newData };
            adminAuthStorage.setUser(updatedUser);
            window.dispatchEvent(new Event('adminUserUpdated'));
        }
    }
};