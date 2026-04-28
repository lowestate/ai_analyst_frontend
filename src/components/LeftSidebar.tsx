import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
    sessions: ChatSession[];
    activeChat: string | null;
    onSelectChat: (id: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({ sessions, activeChat, onSelectChat, onFileUpload }) => {
    // Добавляем тестовый неактивный чат чисто для визуальной проверки стилей
    const displaySessions = [...sessions, { id: 'dummy-1', datasetName: 'Анализ логов сервера', filename: 'server_logs.csv' }];

    return (
        <div className="col-left">
            <label className="btn-upload">
                Загрузить данные
                <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={onFileUpload} />
            </label>
            <div className="chat-list">
                {displaySessions.map(s => (
                    <div 
                        key={s.id} 
                        className={`chat-item ${s.id === activeChat ? 'active' : ''}`} 
                        onClick={() => s.id !== 'dummy-1' && onSelectChat(s.id)}
                    >
                        <div className="dataset-desc">{s.datasetName}</div>
                        <div className="dataset-name">{s.filename}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};