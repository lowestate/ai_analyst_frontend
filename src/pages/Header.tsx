import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    currentUser: { username: string; id: number; role?: string } | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
    isChatMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    currentUser,
    onOpenAuth,
    onLogout,
    onOpenProfile,
    isChatMode = false,
}) => {
    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: "rgba(253, 252, 247, 0.9)",
                backdropFilter: "blur(8px)",
                width: "100%",
                height: "64px",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth: "90%",
                    margin: "0 auto",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo area */}
                <Link
                    to="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "var(--fg-color)",
                            color: "var(--bg-color)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "10px",
                            fontFamily: "var(--font-pixel)",
                        }}
                    >
                        DO
                    </div>
                    <div style={{ lineHeight: 1.1 }}>
                        <div
                            style={{
                                fontWeight: "bold",
                                fontSize: "14px",
                                letterSpacing: "-0.02em",
                                color: "var(--fg-color)",
                            }}
                        >
                            dataoffice
                        </div>
                        <div
                            className="font-mono"
                            style={{
                                fontSize: "9px",
                                color: "var(--muted-fg)",
                                textTransform: "uppercase",
                            }}
                        >
                            v.2.4 · build 2026
                        </div>
                    </div>
                </Link>

                {/* Cabinet label if isChatMode is true */}
                {isChatMode && (
                    <div
                        className="font-mono"
                        style={{
                            marginLeft: "16px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            flex: 1,
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span>
                            <span style={{ color: "var(--muted-fg)" }}>&gt; кабинет 301 </span>
                            <span style={{ color: "var(--primary-color)" }}>Анализ данных</span>
                        </span>
                    </div>
                )}

                {/* Navigation links if isChatMode is false */}
                {!isChatMode && (
                    <nav
                        className="font-mono"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "28px",
                            fontSize: "13px",
                            fontWeight: 500,
                        }}
                    >
                        <a href="#team" style={{ textDecoration: "none", color: "var(--fg-color)" }}>Команда</a>
                        <a href="#modules" style={{ textDecoration: "none", color: "var(--fg-color)" }}>Модули</a>
                        <a href="#workflow" style={{ textDecoration: "none", color: "var(--fg-color)" }}>Процесс</a>
                        <a href="#contact" style={{ textDecoration: "none", color: "var(--fg-color)" }}>Контакты</a>
                    </nav>
                )}

                {/* Right controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {/* "Записаться" button if not in chat mode */}
                    {!isChatMode && (
                        <a
                            href="#contact"
                            className="font-mono"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "var(--fg-color)",
                                color: "var(--bg-color)",
                                padding: "8px 16px",
                                fontSize: "13px",
                                textDecoration: "none",
                                fontWeight: 500,
                                transition: "background-color 0.2s",
                            }}
                        >
                            Записаться <span className="animate-blink">█</span>
                        </a>
                    )}

                    {/* Authentication state triggers */}
                    {!currentUser ? (
                        <button
                            className="btn-login-header"
                            onClick={onOpenAuth}
                            style={{
                                backgroundColor: "var(--primary-color)",
                                color: "var(--primary-fg)",
                                border: "1px solid var(--primary-color)",
                                padding: "8px 18px",
                                borderRadius: "4px",
                                fontFamily: "var(--font-mono)",
                                fontWeight: 600,
                                fontSize: "11px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            Войти
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {currentUser.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="btn-admin-header"
                                    style={{
                                        background: 'none',
                                        border: `1px solid var(--fg-color)`,
                                        borderRadius: '4px',
                                        padding: '6px 12px',
                                        fontSize: '11px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 600,
                                        color: 'var(--fg-color)',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Админка
                                </Link>
                            )}
                            <div
                                className="header-username"
                                onClick={onOpenProfile}
                                title="Личный кабинет"
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    color: 'var(--fg-color)',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                {currentUser.username}
                            </div>
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
                                    color: 'var(--muted-fg)',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--fg-color)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-fg)')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};