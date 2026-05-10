import React, { useState } from 'react';
import { ChatSession } from '../types';
import { COLORS } from '../globasStyles'

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenUploadModal: () => void;
    onDeleteChat: (id: string) => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({ sessions, activeChat, onSelectChat, onOpenUploadModal, onDeleteChat }) => {
    const displaySessions = [...sessions].reverse();

    const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
    const [isDeletingVisible, setIsDeletingVisible] = useState(false);
    
    // Храним координаты чата, чтобы отрендерить окно удаления ровно под ним
    const [modalRect, setModalRect] = useState<{ top: number, right: number, width: number, height: number } | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        
        // Получаем точные координаты плашки на экране
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
        // Запускаем 0.1с анимацию
        setTimeout(() => setIsDeletingVisible(true), 10);
    };

    const cancelDelete = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsDeletingVisible(false); // Прячем обратно под плашку
        
        // Ждем 0.1 секунды (100мс) до полного скрытия
        setTimeout(() => {
            setDeletingChatId(null);
            setModalRect(null);
        }, 100);
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setIsDeletingVisible(false);
        setTimeout(() => {
            onDeleteChat(id);
            setDeletingChatId(null);
            setModalRect(null);
        }, 100);
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
            
            <div className="chat-list" style={{ position: 'relative' }}>
                {displaySessions.map(s => {
                    const isActive = s.id === activeChat;
                    const isDeletingThis = deletingChatId === s.id;
                    
                    return (
                        <div 
                            key={s.id}
                            className="chat-item-container" // Класс-маркер для поиска координат
                            style={{
                                position: 'relative',
                                // Активный/удаляемый чат поднимаем над серым фоном
                                zIndex: (isActive || isDeletingThis) ? 9999 : 1,
                            }}
                        >
                            {/* ПЛАШКА ЧАТА */}
                            <div 
                                className={`chat-item ${isActive ? 'active' : ''}`} 
                                onClick={() => !isDeletingThis && onSelectChat(s.id)}
                                style={{
                                    position: 'relative',
                                    zIndex: 9999, // Чат ВСЕГДА перекрывает выезжающее окошко
                                    backgroundColor: (isActive || isDeletingThis) ? '#ffffff' : 'transparent',
                                    transition: 'background-color 0.2s ease',
                                    cursor: isDeletingThis ? 'default' : 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div className="dataset-desc">{formatLongText(s.datasetName)}</div>
                                    <div className="dataset-name">{formatLongText(s.filename)}</div>
                                </div>

                                <button 
                                    onClick={(e) => handleDeleteClick(e, s.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: COLORS.black, borderRadius: '4px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: isActive ? 1 : 0.3,
                                        transition: 'opacity 0.2s, color 0.2s',
                                        marginLeft: '3px'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ВЫЕЗЖАЮЩЕЕ ОКОШКО (Рендерится вне скроллов, поверх всей страницы) */}
            {deletingChatId && modalRect && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed', // Отвязываем от сайдбара (никаких серых полосок)
                        top: modalRect.top, 
                        // Скрываем ровно под правой половиной плашки чата
                        left: modalRect.right - (modalRect.width * 0.8) + 10, 
                        width: modalRect.width * 0.8,
                        height: modalRect.height,
                        backgroundColor: '#ffffff',
                        zIndex: 9995, // Ниже плашки чата (9999), но выше затемнения (9990)
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0px 10px',
                        boxSizing: 'border-box',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        boxShadow: '4px 4px 15px rgba(0,0,0,0.1)',
                        
                        // Выезжает вправо ровно на свою ширину. Анимация 0.1с
                        transform: isDeletingVisible ? 'translateX(100%)' : 'translateX(0)',
                        transition: 'transform 0.1s linear'
                    }}
                >
                    <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: COLORS.black, 
                        textAlign: 'left', 
                        marginBottom: '6px',
                        lineHeight: '1',
                        whiteSpace: 'nowrap'
                    }}>
                        Удалить чат навсегда?
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                            onClick={(e) => confirmDelete(e, deletingChatId)}
                            style={{ flex: 1, fontSize: '12px', padding: '4px 0', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                        >
                            Удалить
                        </button>
                        <button 
                            onClick={cancelDelete}
                            style={{ flex: 1, fontSize: '12px', padding: '4px 0', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                        >
                            Оставить
                        </button>
                    </div>
                </div>
            )}

            {/* ЗАТЕМНЕНИЕ ФОНА (Анимация 0.1 сек) */}
            {deletingChatId && (
                <div 
                    onClick={cancelDelete}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: 9990, 
                        opacity: isDeletingVisible ? 1 : 0,
                        transition: 'opacity 0.1s linear',
                        pointerEvents: isDeletingVisible ? 'auto' : 'none'
                    }}
                />
            )}
        </div>
    );
};