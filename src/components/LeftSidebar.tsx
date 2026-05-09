import React, { useState } from 'react';
import { ChatSession } from '../types';
import { COLORS } from '../colorPalette'

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenUploadModal: () => void;
    onDeleteChat: (id: string) => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({ sessions, activeChat, onSelectChat, onOpenUploadModal, onDeleteChat }) => {
    // Делаем копию и переворачиваем, чтобы новые сессии были сверху
    const displaySessions = [...sessions].reverse();

    const [chatToDelete, setChatToDelete] = useState<any>(null);

    // Функция вызова модалки (предотвращает нажатие на сам чат)
    const handleDeleteClick = (e: React.MouseEvent, session: any) => {
        e.stopPropagation(); // ВАЖНО: чтобы не вызвался onSelectChat
        setChatToDelete(session);
    };

    const confirmDelete = () => {
        if (chatToDelete) {
            onDeleteChat(chatToDelete.id);
            setChatToDelete(null);
        }
    };

    const formatLongText = (text: string) => {
        if (!text) return '';
        return text
            .split('_').join('_\u200B')
            .split('.').join('.\u200B')
            .split('-').join('-\u200B');
    };

    return (
        <div className="col-left">
            <button className="btn-upload" onClick={onOpenUploadModal}>
                Новый анализ
            </button>
            <div className="chat-list">
                {displaySessions.map(s => {
                    const isActive = s.id === activeChat;
                    
                    return (
                        <div 
                            key={s.id} 
                            className={`chat-item ${isActive ? 'active' : ''}`} 
                            onClick={() => onSelectChat(s.id)}
                            style={{
                                // Применяем белый фон только если чат активен, иначе убираем фон
                                backgroundColor: isActive ? '#ffffff' : 'transparent',
                                transition: 'background-color 0.2s ease',
                                cursor: 'pointer',
                                display: 'flex',           // Делаем элемент flex-контейнером
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start'   // Корзина будет сверху, если текст длинный
                            }}
                        >
                            {/* Блок с текстами */}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div className="dataset-desc">{formatLongText(s.datasetName)}</div>
                                <div className="dataset-name">{formatLongText(s.filename)}</div>
                            </div>

                            {/* Кнопка удаления (мусорка) */}
                            <button 
                                onClick={(e) => handleDeleteClick(e, s)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: COLORS.black, borderRadius: '4px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: isActive ? 1 : 0.3, // Менее заметна на неактивных чатах
                                    transition: 'opacity 0.2s, color 0.2s',
                                    marginLeft: '3px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.color = COLORS.black; // Чуть темнее при наведении
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = isActive ? '1' : '0.3';
                                    e.currentTarget.style.color = COLORS.gray900;
                                }}
                                title="Удалить чат"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
            {chatToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#fff', padding: '24px', borderRadius: '12px',
                        width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>Удалить чат?</h3>
                        <p style={{ color: '#475569', lineHeight: '1.5', marginBottom: '24px', fontSize: '14px' }}>
                            Удалить чат <strong>"{chatToDelete.datasetName}"</strong> для файла <strong>"{chatToDelete.filename}"</strong>? Это действие нельзя отменить.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button 
                                onClick={() => setChatToDelete(null)}
                                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                            >
                                Оставить
                            </button>
                            <button 
                                onClick={confirmDelete}
                                style={{ padding: '8px 16px', border: 'none', background: '#ef4444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};