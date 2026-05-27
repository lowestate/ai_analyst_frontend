import React, { useState } from 'react';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: (user: { username: string; id: number; role?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [showAuthPassword, setShowAuthPassword] = useState(false);
    const [authErrors, setAuthErrors] = useState({ username: '', password: '', general: '' });
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthForm({ ...authForm, [e.target.name]: e.target.value });
        setAuthErrors({ ...authErrors, [e.target.name]: '', general: '' });
    };

    const validateAuth = () => {
        let isValid = true;
        const newErrors = { username: '', password: '', general: '' };

        if (authMode === 'register') {
            const usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
            if (!usernameRegex.test(authForm.username)) {
                newErrors.username = 'Только английские буквы, цифры и _, минимум 4 символа';
                isValid = false;
            }
            if (authForm.password.length < 6) {
                newErrors.password = 'Пароль должен быть минимум 6 символов';
                isValid = false;
            }
        } else {
            if (!authForm.username) { newErrors.username = 'Введите логин'; isValid = false; }
            if (!authForm.password) { newErrors.password = 'Введите пароль'; isValid = false; }
        }

        setAuthErrors(newErrors);
        return isValid;
    };

    const handleAuthSubmit = async () => {
        if (!validateAuth()) return;
        setIsAuthLoading(true);

        try {
            const endpoint = authMode === 'login' ? '/login' : '/register';
            const res = await fetch(`http://localhost:8001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });

            const data = await res.json();

            if (!res.ok) {
                let errorText = data.detail || 'Ошибка авторизации';
                if (errorText.includes("Вы заблокированы за нарушение правил безопасности")) {
                    errorText = "Ваш аккаунт заблокирован. Если это ошибка, напишите на почту help@dataoffice.ru";
                }
                setAuthErrors(prev => ({ ...prev, general: errorText }));
                return;
            }

            // Успех
            onSuccess({ username: authForm.username, id: data.user_id, role: data.role });
            onClose();

        } catch (err) {
            setAuthErrors(prev => ({ ...prev, general: 'Ошибка сети' }));
        } finally {
            setIsAuthLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="btn-close-modal" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="auth-title">
                    {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
                </div>

                <div className="auth-form-container">
                    <div className="upload-form-group auth-group">
                        <input
                            className="upload-input" type="text" name="username"
                            placeholder="Логин" value={authForm.username} onChange={handleAuthChange}
                        />
                        {authErrors.username && <span className="auth-error-text">{authErrors.username}</span>}
                    </div>

                    <div className="upload-form-group auth-group password-wrapper">
                        <input
                            className="upload-input" type={showAuthPassword ? "text" : "password"} name="password"
                            placeholder="Пароль" value={authForm.password} onChange={handleAuthChange}
                        />
                        <button
                            type="button" className={`eye-btn ${showAuthPassword ? 'open' : ''}`}
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                                <line x1="3" y1="3" x2="21" y2="21" className="eye-slash" />
                            </svg>
                        </button>
                        {authErrors.password && <span className="auth-error-text">{authErrors.password}</span>}
                        {authErrors.general && !authErrors.password && <span className="auth-error-text" style={{ bottom: '-35px' }}>{authErrors.general}</span>}
                    </div>

                    <div
                        className="auth-switch-text"
                        onClick={() => {
                            setAuthMode(authMode === 'login' ? 'register' : 'login');
                            setAuthErrors({ username: '', password: '', general: '' });
                        }}
                    >
                        {authMode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                    </div>

                    <button className="btn-auth-submit" onClick={handleAuthSubmit} disabled={isAuthLoading}>
                        {isAuthLoading ? 'Загрузка...' : (authMode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </div>
            </div>
        </div>
    );
};