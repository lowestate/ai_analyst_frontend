import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COLORS } from '../../globasStyles';
import { LLMRequestsTable } from './LLMRequestsTable';
import { UsersTable } from './UsersTable';
import { Header } from '../Header';

export const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const [activeTab, setActiveTab] = useState<'llm_requests' | 'users'>('llm_requests');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = async () => {
        if (!currentUser) return;
        try {
            await fetch(`http://localhost:8001/logout?user_id=${currentUser.id}`, {
                method: "POST",
            });
        } catch (err) {
            console.error("Ошибка при выходе из системы", err);
        }
        localStorage.removeItem("currentUser");
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', width: '100%' }}>
            <Header
                currentUser={currentUser}
                onOpenAuth={() => { }}
                onLogout={handleLogout}
                onOpenProfile={() => navigate('/analyze', { state: { view: 'profile' } })}
                isAdminMode={true}
            />

            <div className="user-page-wrapper" style={{ padding: '40px 24px', maxWidth: '100vw', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
                {/* Всплывающий Тост-уведомление */}
                {toast && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            background: toast.type === 'success' ? '#e6f4ea' : '#fce8e6',
                            border: `1.5px solid ${toast.type === 'success' ? '#137333' : '#c5221f'}`,
                            color: toast.type === 'success' ? '#137333' : '#c5221f',
                            padding: '12px 24px',
                            borderRadius: '0px',
                            boxShadow: 'var(--shadow-paper)',
                            zIndex: 1000,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: 'var(--font-mono)',
                            animation: 'slideUp 0.2s ease-out'
                        }}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="profile-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div className="label-tag">
                        <span className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'inline-block' }}></span>
                        SECURITY & AUDIT · ADMIN CONSOLE
                    </div>
                </div>

                {/* Кнопка открытия Dozzle */}
                <div style={{ width: '100%', maxWidth: '1400px', marginBottom: '12px', boxSizing: 'border-box' }}>
                    <a
                        href="http://localhost:8080"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0px',
                            background: 'var(--card-bg)',
                            color: 'var(--fg-color)',
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--fg-color)';
                            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--bg-color)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--card-bg)';
                            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg-color)';
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        Открыть логи (Dozzle)
                    </a>
                </div>

                {/* Вкладки в ретро-бруталистском стиле */}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(241, 243, 245, 0.4)',
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderBottom: 'none',
                    gap: '8px',
                    maxWidth: '1400px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <button
                        onClick={() => setActiveTab('llm_requests')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0px',
                            background: activeTab === 'llm_requests' ? 'var(--fg-color)' : 'var(--card-bg)',
                            color: activeTab === 'llm_requests' ? 'var(--bg-color)' : 'var(--fg-color)',
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            outline: 'none'
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Логи LLM запросов
                    </button>

                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0px',
                            background: activeTab === 'users' ? 'var(--fg-color)' : 'var(--card-bg)',
                            color: activeTab === 'users' ? 'var(--bg-color)' : 'var(--fg-color)',
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            outline: 'none'
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Пользователи
                    </button>
                </div>

                {/* Контейнер содержимого */}
                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '0px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-paper)',
                    width: '100%',
                    maxWidth: '1400px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    marginBottom: '40px'
                }}>
                    {activeTab === 'llm_requests' ? (
                        <LLMRequestsTable />
                    ) : (
                        <UsersTable currentUser={currentUser} showToast={showToast} />
                    )}
                </div>
            </div>
        </div>
    );
};
