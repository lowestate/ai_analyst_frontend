import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../../globasStyles';
import { LLMRequestsTable } from './LLMRequestsTable';
import { UsersTable } from './UsersTable';

export const AdminPanel: React.FC = () => {
    const storedUser = localStorage.getItem('currentUser');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    const [activeTab, setActiveTab] = useState<'llm_requests' | 'users'>('llm_requests');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="user-page-wrapper" style={{ padding: '40px 16px', maxWidth: '100vw', overflowX: 'hidden' }}>
            {/* Всплывающий Тост-уведомление */}
            {toast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        background: toast.type === 'success' ? '#e6f4ea' : '#fce8e6',
                        border: `1px solid ${toast.type === 'success' ? '#137333' : '#c5221f'}`,
                        color: toast.type === 'success' ? '#137333' : '#c5221f',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        fontWeight: 600,
                        fontSize: '14px',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    {toast.message}
                </div>
            )}

            <Link
                to="/"
                className="btn-back-chat"
                style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Вернуться в чат
            </Link>

            <div className="profile-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: COLORS.gray900, marginBottom: '8px' }}>
                    Админ-панель
                </h1>
                <p style={{ fontSize: '15px', color: COLORS.gray500 }}>
                    Управление пользователями и мониторинг системных логов чата
                </p>
            </div>

            {/* Вкладки в стиле Google Chrome */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                background: '#e2e8f0',
                padding: '8px 16px 0 16px',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderBottom: `1px solid ${COLORS.gray200}`,
                gap: '4px',
                maxWidth: '1400px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div
                    onClick={() => setActiveTab('llm_requests')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'llm_requests' ? 600 : 500,
                        color: activeTab === 'llm_requests' ? COLORS.gray900 : COLORS.gray600,
                        background: activeTab === 'llm_requests' ? COLORS.white : 'transparent',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        border: activeTab === 'llm_requests' ? `1px solid ${COLORS.gray200}` : 'none',
                        borderBottom: activeTab === 'llm_requests' ? `1px solid ${COLORS.white}` : 'none',
                        marginBottom: '-1px',
                        position: 'relative',
                        zIndex: activeTab === 'llm_requests' ? 2 : 1,
                        transition: 'background-color 0.2s',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== 'llm_requests') {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== 'llm_requests') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Логи LLM запросов
                </div>

                <div
                    onClick={() => setActiveTab('users')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: activeTab === 'users' ? 600 : 500,
                        color: activeTab === 'users' ? COLORS.gray900 : COLORS.gray600,
                        background: activeTab === 'users' ? COLORS.white : 'transparent',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        border: activeTab === 'users' ? `1px solid ${COLORS.gray200}` : 'none',
                        borderBottom: activeTab === 'users' ? `1px solid ${COLORS.white}` : 'none',
                        marginBottom: '-1px',
                        position: 'relative',
                        zIndex: activeTab === 'users' ? 2 : 1,
                        transition: 'background-color 0.2s',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== 'users') {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== 'users') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Пользователи
                </div>
            </div>

            {/* Контейнер содержимого */}
            <div style={{
                background: COLORS.white,
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                border: `1px solid ${COLORS.gray200}`,
                borderTop: 'none',
                boxShadow: `0 4px 12px ${COLORS.shadowLight05}`,
                width: '100%',
                maxWidth: '1400px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}>
                {activeTab === 'llm_requests' ? (
                    <LLMRequestsTable />
                ) : (
                    <UsersTable currentUser={currentUser} showToast={showToast} />
                )}
            </div>
        </div>
    );
};
