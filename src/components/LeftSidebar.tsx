import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenUploadModal: () => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({ sessions, activeChat, onSelectChat, onOpenUploadModal }) => {
    // Делаем копию и переворачиваем, чтобы новые сессии были сверху
    const displaySessions = [...sessions].reverse();

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
                                cursor: 'pointer'
                            }}
                        >
                            <div className="dataset-desc">{formatLongText(s.datasetName)}</div>
                            <div className="dataset-name">{formatLongText(s.filename)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};