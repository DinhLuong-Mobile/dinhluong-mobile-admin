import { createContext, useContext } from 'react';
import type { User } from '../types/auth.types'; 


export interface AuthContextType {
    user: User | null;
    isLogin: boolean;
    login: (userData: User) => void;
    logout: () => void;
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};