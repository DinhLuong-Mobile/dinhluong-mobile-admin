import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Nếu bạn muốn dùng thông báo của antd ở đây
import './AdminLogin.css';

// Định nghĩa kiểu dữ liệu cho Response trả về từ API
interface LoginResponse {
    message?: string;
    data?: {
        token: string;
    };
}

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 1. KHỞI TẠO NAVIGATE Ở ĐÂY
    const navigate = useNavigate(); 

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Reset lỗi và bật trạng thái loading
        setErrorMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = (await response.json()) as LoginResponse;

            if (response.ok && data.data && data.data.token) {
                const token = data.data.token;
                
                // 2. CHUYỂN HƯỚNG KÈM TOKEN LÊN URL
                // Trả lại cách này để file AdminProtectedRoute tự lấy token, giải mã và set Role
                navigate(`/admin?token=${token}`);
                
            } else {
                setErrorMessage(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
            }
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            setErrorMessage('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-wrapper">
                {/* Cột Trái: Branding Gradient đỏ */}
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