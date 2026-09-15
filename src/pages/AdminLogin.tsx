import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAuthService } from '../services'; 
import { ADMIN_ROUTES } from '../constants/routes';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate(); 
    const { login } = useAuth(); 

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setErrorMessage('');
        setIsLoading(true);

        try {
            const response = await adminAuthService.login({ email, password });
            if (response && response.code === 200 && response.data) {
                login({
                    id: response.data.id,
                    email: response.data.email,
                    name: response.data.name,
                    avatar: response.data.avatar,
                    typeAccount: response.data.typeAccount,
                    token: response.data.token,
                    role: response.data.role || 'ADMIN'         
                });
                navigate(ADMIN_ROUTES.ADMIN_ROOT);
                
            } else {
                setErrorMessage(response?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
            }
        } catch (error: any) {
            console.error('Lỗi kết nối:', error);
            setErrorMessage(error?.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-wrapper">
                {/* Cột Trái: Branding Gradient đỏ (Giữ nguyên UI của bạn) */}
                <div className="branding-side">
                    <div className="brand-logo">
                        DLM<span>Store</span>
                    </div>
                    <div className="brand-welcome">
                        <h2>Hệ thống<br />Quản trị Cấp cao</h2>
                        <p>Nền tảng vận hành và quản lý dữ liệu tập trung dành cho đội ngũ DinhLuongMobile.</p>
                    </div>
                </div>

                {/* Cột bên phải - Form */}
                <div className="form-side">
                    <div className="form-header">
                        <h3>Đăng nhập Workspace</h3>
                        <p>Vui lòng nhập thông tin xác thực để tiếp tục</p>
                    </div>

                    {/* Hiển thị thông báo lỗi nếu có */}
                    {errorMessage && (
                        <div className="error-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* Các input giữ nguyên như cũ... */}
                        <div className="input-group">
                            <label htmlFor="email">Tài khoản Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="admin@dlmstore.com"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                        </div>

                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                    </svg>
                                    Đang xác thực...
                                </>
                            ) : (
                                'Truy cập hệ thống'
                            )}
                        </button>
                    </form>

                    <div className="system-footer">
                        &copy; 2026 DinhLuongMobile. Internal Use Only.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;