import React from 'react';
import { COLORS } from '../globasStyles';

interface HeaderProps {
    currentUser: { username: string; id: number } | null;
    onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenAuth }) => {
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
                <div style={{ fontWeight: 600, color: COLORS.gray700 }}>
                    {currentUser.username}
                </div>
            )}
        </header>
    );
};