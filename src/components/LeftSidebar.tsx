import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onOpenUploadModal: () => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({ sessions, activeChat, onSelectChat, onOpenUploadModal }) => {
    // Добавляем тестовый неактивный чат чисто для визуальной проверки стилей
    const displaySessions = [...[...sessions].reverse()]    ;

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
                {displaySessions.map(s => (
                    <div 
                        key={s.id} 
                        className={`chat-item ${s.id === activeChat ? 'active' : ''}`} 
                        onClick={() => s.id !== 'dummy-1' && onSelectChat(s.id)}
                    >
                        <div className="dataset-desc">{formatLongText(s.datasetName)}</div>
                        <div className="dataset-name">{formatLongText(s.filename)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};