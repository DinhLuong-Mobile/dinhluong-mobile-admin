import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/roles';

const AdminProtectedRoute: React.FC = () => {
    const { user, isLogin } = useAuth();

    const isAdmin = isLogin && user 
        ? (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.ROLE_ADMIN) 
        : false;
        
    if (!isAdmin) {
        return <Navigate to={ADMIN_ROUTES.LOGIN} replace />;
    }
    return <Outlet />;
};

export default AdminProtectedRoute;