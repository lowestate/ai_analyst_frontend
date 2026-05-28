import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    currentUser: { username: string; id: number; role?: string } | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
    isChatMode?: boolean;
    isAdminMode?: boolean;
    isDashboardMode?: boolean;
    isCabinetMode?: boolean;
    activeChatId?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
    currentUser,
    onOpenAuth,
    onLogout,
    onOpenProfile,
    isChatMode = false,
    isAdminMode = false,
    isDashboardMode = false,
    isCabinetMode = false,
    activeChatId = null,
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
                height: "55px",
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

                {/* Cabinet label if isChatMode or isAdminMode or isDashboardMode or isCabinetMode is true */}
                {(isChatMode || isAdminMode || isDashboardMode || isCabinetMode) && (
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
                        {isAdminMode ? (
                            <span>
                                <span style={{ color: "var(--muted-fg)" }}>&gt; кабинет 507 </span>
                                <span style={{ color: "var(--primary-color)" }}>Администрация</span>
                            </span>
                        ) : isDashboardMode ? (
                            <span>
                                <span style={{ color: "var(--muted-fg)" }}>&gt; </span>
                                <Link
                                    to="/analyze"
                                    state={{ activeChatId }}
                                    style={{
                                        textDecoration: "underline dashed var(--muted-fg)",
                                        textUnderlineOffset: "3px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span style={{ color: "var(--muted-fg)" }}>кабинет 301 </span>
                                    <span style={{ color: "var(--primary-color)" }}>Аналитик данных</span>
                                </Link>
                                <span style={{ color: "var(--muted-fg)" }}> &gt; кабинет 412 </span>
                                <span style={{ color: "var(--primary-color)" }}>Отдел визуализации</span>
                            </span>
                        ) : isCabinetMode ? (
                            <span>
                                <span style={{ color: "var(--muted-fg)" }}>&gt; </span>
                                <Link
                                    to="/analyze"
                                    state={{ activeChatId }}
                                    style={{
                                        textDecoration: "underline dashed var(--muted-fg)",
                                        textUnderlineOffset: "3px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span style={{ color: "var(--muted-fg)" }}>кабинет 301 </span>
                                    <span style={{ color: "var(--primary-color)" }}>Аналитик данных</span>
                                </Link>
                                <span style={{ color: "var(--muted-fg)" }}> &gt; кабинет 108 </span>
                                <span style={{ color: "var(--primary-color)" }}>Личный кабинет</span>
                            </span>
                        ) : (
                            <span>
                                <span style={{ color: "var(--muted-fg)" }}>&gt; кабинет 301 </span>
                                <span style={{ color: "var(--primary-color)" }}>Аналитик данных</span>
                            </span>
                        )}
                    </div>
                )}

                {/* Navigation links if isChatMode, isAdminMode, isDashboardMode and isCabinetMode are false */}
                {!isChatMode && !isAdminMode && !isDashboardMode && !isCabinetMode && (
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
                    {/* "Войти" button styled like "Записаться" if not logged in */}
                    {!currentUser && !isChatMode && (
                        <button
                            onClick={onOpenAuth}
                            className="font-mono"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: "var(--fg-color)",
                                color: "var(--bg-color)",
                                padding: "8px 16px",
                                fontSize: "13px",
                                border: "none",
                                borderRadius: "0px",
                                fontWeight: 500,
                                transition: "background-color 0.2s",
                                cursor: "pointer",
                                fontFamily: "var(--font-mono)"
                            }}
                        >
                            Войти <span className="animate-blink">█</span>
                        </button>
                    )}

                    {/* Authentication state triggers */}
                    {currentUser && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {!isAdminMode && (currentUser.role === 'admin' || currentUser.role === 'Админ') && (
                                <Link
                                    to="/admin"
                                    className="btn-unified"
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Админка
                                </Link>
                            )}
                            <Link
                                to="/cabinet"
                                state={{ activeChatId }}
                                className="header-username"
                                title="Личный кабинет"
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 600,
                                    color: 'var(--fg-color)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    textDecoration: "none"
                                }}
                            >
                                {currentUser.username}
                            </Link>
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