import React from 'react';
import { COLORS } from '../globasStyles';

interface HeaderProps {
    currentUser: { username: string; id: number } | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenAuth, onLogout, onOpenProfile }) => {
    return (
        <header className="app-header">
            <div className="header-logo-container">
                <svg width="34" height="26" viewBox="0 0 40 30" fill="none" style={{ display: 'block' }}>
                    <rect x="2" y="2" width="36" height="26" rx="6" fill="#ffffff" />
                    <path d="M 2 15 H 20 V 2 H 8 A 6 6 0 0 0 2 8 V 15 Z" fill={COLORS.accent_ligher} />
                    <path d="M 20 15 H 38 V 8 A 6 6 0 0 0 32 2 H 20 V 15 Z" fill={COLORS.accent_ligher} />
                    <rect x="2" y="2" width="36" height="26" rx="6" stroke="#343434" strokeWidth="3" fill="none" />
                    <line x1="2" y1="15" x2="38" y2="15" stroke="#343434" strokeWidth="3" />
                    <line x1="20" y1="2" x2="20" y2="28" stroke="#343434" strokeWidth="3" />
                </svg>
                <span className="header-title">t<span className="ai-highlight">ai</span>ble</span>
            </div>

            {!currentUser ? (
                <button className="btn-login-header" onClick={onOpenAuth}>
                    Войти
                </button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        className="header-username"
                        onClick={onOpenProfile}
                        title="Личный кабинет"
                        style={{ fontWeight: 600, color: COLORS.gray700, marginBottom: '5px' }}
                    >
                        {currentUser.username}
                    </div>
                    {/* --- ДОБАВЛЕНА КНОПКА ВЫХОДА --- */} 
                    <button
                        onClick={onLogout}
                        title="Выйти"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                            color: '#9CA3AF', // Серая по дефолту
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')} // Черная при наведении
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                    >
                        {/* Иконка логаута */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            )}
        </header>
    );
};