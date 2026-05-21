import React, { useState } from 'react';
import { ChatSession } from '../types';
import { COLORS } from '../globasStyles'

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenUploadModal: () => void;
    onDeleteChat: (id: string) => void;
    isSidebarHidden: boolean;
    onToggleSidebar: () => void;
    isBanned?: boolean;
}

export const LeftSidebar: React.FC<SidebarProps> = ({
    sessions,
    activeChat,
    onSelectChat,
    onOpenUploadModal,
    onDeleteChat,
    isSidebarHidden,
    onToggleSidebar,
    isBanned = false
}) => {
    const displaySessions = [...sessions].reverse();

    const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
    const [isDeletingVisible, setIsDeletingVisible] = useState(false);

    const [modalRect, setModalRect] = useState<{
        top: number;
        right: number;
        width: number;
        height: number;
    } | null>(null);

    const handleDeleteClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        id: string
    ): void => {
        e.stopPropagation();

        const node = e.currentTarget.closest('.chat-item-container');

        if (node) {
            const rect = node.getBoundingClientRect();

            setModalRect({
                top: rect.top,
                right: rect.right,
                width: rect.width,
                height: rect.height
            });
        }

        setDeletingChatId(id);

        requestAnimationFrame(() => {
            setIsDeletingVisible(true);
        });
    };

    const cancelDelete = (e?: React.MouseEvent): void => {
        if (e) {
            e.stopPropagation();
        }

        setIsDeletingVisible(false);

        setTimeout(() => {
            setDeletingChatId(null);
            setModalRect(null);
        }, 220);
    };

    const confirmDelete = (
        e: React.MouseEvent<HTMLButtonElement>,
        id: string
    ): void => {
        e.stopPropagation();

        setIsDeletingVisible(false);

        setTimeout(() => {
            onDeleteChat(id);
            setDeletingChatId(null);
            setModalRect(null);
        }, 220);
    };

    const formatLongText = (text: string): string => {
        if (!text) {
            return '';
        }

        return text
            .split('_').join('_\u200B')
            .split('.').join('.\u200B')
            .split('-').join('-\u200B');
    };

    return (
        <div className="col-left">
            <div style={{ display: 'flex', flexDirection: 'row', gap: isSidebarHidden ? '4px' : '8px', marginBottom: '24px', alignItems: 'center', justifyContent: isSidebarHidden ? 'center' : 'flex-start' }}>
                <button onClick={onToggleSidebar} className="sidebar-toggle-btn" title={isSidebarHidden ? 'Показать меню' : 'Скрыть меню'}>
                    {isSidebarHidden ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    )}
                </button>
                <button
                    className="btn-upload"
                    onClick={() => { if (!isBanned) onOpenUploadModal(); }}
                    disabled={isBanned}
                    style={{
                        opacity: isBanned ? 0.5 : 1,
                        cursor: isBanned ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSidebarHidden ? '+' : 'Новый анализ'}
                </button>
            </div>

            <div
                className="chat-list"
                style={{ position: 'relative' }}
            >
                {displaySessions.map((s) => {
                    const isActive = s.id === activeChat;
                    const isDeletingThis = deletingChatId === s.id;

                    return (
                        <div
                            key={s.id}
                            className="chat-item-container"
                            style={{
                                position: 'relative',
                                zIndex: isDeletingThis ? 9999 : 1
                            }}
                        >
                            <div
                                className={`chat-item ${isActive && !isDeletingThis ? 'active' : ''
                                    }`}
                                onClick={() => {
                                    if (!isDeletingThis) {
                                        onSelectChat(s.id);
                                    }
                                }}
                                style={{
                                    position: 'relative',
                                    zIndex: 9999,
                                    backgroundColor: isDeletingThis
                                        ? '#ffffff'
                                        : undefined,
                                    transition:
                                        'background-color 0.25s ease, box-shadow 0.25s ease',
                                    cursor: isDeletingThis
                                        ? 'default'
                                        : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div className="dataset-desc">
                                        {formatLongText(s.datasetName)}
                                    </div>

                                    <div className="dataset-name">
                                        {formatLongText(s.filename)}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) =>
                                        handleDeleteClick(e, s.id)
                                    }
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: COLORS.black,
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity:
                                            isActive || isDeletingThis
                                                ? 1
                                                : 0.3,
                                        transition:
                                            'opacity 0.2s ease, color 0.2s ease',
                                        marginLeft: '3px'
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"
                                        />

                                        <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {deletingChatId && modalRect && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: modalRect.top,
                        left:
                            modalRect.right -
                            (modalRect.width * 0.8) +
                            10,
                        width: modalRect.width * 0.8,
                        height: modalRect.height,
                        backgroundColor: '#ffffff',
                        zIndex: 9995,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0px 10px',
                        boxSizing: 'border-box',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',

                        transform: isDeletingVisible
                            ? 'translateX(100%) scale(1)'
                            : 'translateX(20%) scale(0.96)',

                        opacity: isDeletingVisible ? 1 : 0,

                        transition: `
                            transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
                            opacity 180ms ease
                        `
                    }}
                >
                    <div
                        style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: COLORS.black,
                            textAlign: 'left',
                            marginBottom: '6px',
                            lineHeight: '1',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Удалить чат навсегда?
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '4px'
                        }}
                    >
                        <button
                            onClick={(e) =>
                                confirmDelete(e, deletingChatId)
                            }
                            style={{
                                flex: 1,
                                fontSize: '12px',
                                padding: '4px 0',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Удалить
                        </button>

                        <button
                            onClick={cancelDelete}
                            style={{
                                flex: 1,
                                fontSize: '12px',
                                padding: '4px 0',
                                background: '#f1f5f9',
                                color: '#334155',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Оставить
                        </button>
                    </div>
                </div>
            )}

            {deletingChatId && (
                <div
                    onClick={cancelDelete}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 9990,
                        opacity: isDeletingVisible ? 1 : 0,
                        transition: 'opacity 220ms ease',
                        pointerEvents: isDeletingVisible
                            ? 'auto'
                            : 'none'
                    }}
                />
            )}
        </div>
    );
};