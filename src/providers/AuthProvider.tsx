import React, { useState, type ReactNode } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { User } from '../types/auth.types';
import { adminAuthStorage } from '../services/storage/adminAuthStorage';
import { adminAuthService } from '../services'; 

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedData = adminAuthStorage.getUser();
        return storedData?.user || null; 
    });

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        adminAuthService.logout(); 
        setUser(null);
    };

    const isLogin = !!user;

    return (
        <AuthContext.Provider value={{ user, isLogin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};