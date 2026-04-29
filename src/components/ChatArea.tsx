import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChartData } from '../types';
import { SampleTable } from './SampleTable';

interface ChatAreaProps {
    activeChat: string | null;
    messages: Message[];
    loading: boolean;
    loadingPhrase: string;
    input: string;
    setInput: (val: string) => void;
    onSendMessage: (text?: string) => void; // Добавили (text?: string)
    localDataPool: any[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ activeChat, messages, loading, loadingPhrase, input, setInput, onSendMessage, localDataPool }) => {
    const [mockCommands, setMockCommands] = useState<string[]>([]);

    useEffect(() => {
        if (activeChat && activeChat !== "temp_loading") {
            fetch('http://localhost:8000/available_mock_commands') 
                .then(res => res.json())
                .then(data => data.commands && setMockCommands(data.commands))
                .catch(err => console.error("Ошибка загрузки команд:", err));
        }
    }, [activeChat]);

    const getChartTitle = (chart: ChartData) => {
        if (chart.type === 'correlation') return 'Корреляционная матрица';
        if (chart.type === 'category_count' || chart.type === 'numeric_hist') {
            return `Распределение: ${chart.data.column_name}`;
        }
        if (chart.type === 'outliers') {
            return `Аномалии: ${chart.data?.column_name || 'Unknown'}`;
        }
        if (chart.type === 'cross_deps') return 'Кросс-зависимости'
        return 'График';
    };

    return (
        <div className="col-center">
            <div className="messages-wrapper">
                {activeChat && activeChat !== "temp_loading" && localDataPool.length > 0 && (
                    <SampleTable dataPool={localDataPool} />
                )}

                {messages.map(msg => {
                    let chartNotification = null;
                    if (msg.sender === 'agent' && msg.charts && msg.charts.length > 0) {
                        const chartNames = msg.charts.map(c => getChartTitle(c)).join(', ');
                        const isMultiple = msg.charts.length > 1;
                        chartNotification = isMultiple 
                            ? `Добавлены новые графики: ${chartNames}` 
                            : `Добавлен новый график: ${chartNames}`;
                    }

                    return (
                        <div key={msg.id} className={`msg-row ${msg.sender}`}>
                            {chartNotification ? (
                                <div style={{ display: 'flex', flexDirection: 'column', width: '66.66%' }}>
                                    <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginBottom: '6px', marginLeft: '15px', width: '100%', whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4' }}>
                                        {chartNotification}
                                    </div>
                                    <div className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''}`} style={{ width: '100%' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="msg-row agent">
                        <div className="msg-bubble agent">
                            <span className="loading-text">{loadingPhrase}</span>
                        </div>
                    </div>
                )}
            </div>

            {activeChat && activeChat !== "temp_loading" && (
                <div className="input-container" style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                    gap: '10px', width: '100%', paddingBottom: '20px' 
                }}>
                    
                    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        
                        {mockCommands.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start', padding: '0' }}>
                                {mockCommands.map(cmd => (
                                    <button
                                        key={cmd}
                                        disabled={loading} // Не даем кликать во время загрузки
                                        onClick={() => {
                                            setInput(cmd);      // Для красоты заполняем поле
                                            onSendMessage(cmd); // Сразу отправляем значение команды
                                        }}
                                        style={{
                                            background: '#f0f4f8',
                                            border: '1px solid #dce4ec',
                                            borderRadius: '14px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            color: '#4a90e2',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={e => {
                                            if(!loading) {
                                                e.currentTarget.style.background = '#e0f0ff';
                                                e.currentTarget.style.borderColor = '#b3d8ff';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#f0f4f8';
                                            e.currentTarget.style.borderColor = '#dce4ec';
                                        }}
                                    >
                                        {cmd}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="input-box" style={{ width: '100%', margin: '0' }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && onSendMessage()}
                                placeholder="Что исследуем?"
                                disabled={loading}
                            />
                            <button onClick={() => onSendMessage()} disabled={loading}>❯</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};