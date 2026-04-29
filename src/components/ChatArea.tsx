import React from 'react';
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
    onSendMessage: () => void;
    localDataPool: any[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ activeChat, messages, loading, loadingPhrase, input, setInput, onSendMessage, localDataPool }) => {
    
    const getChartTitle = (chart: ChartData) => {
        if (chart.type === 'correlation') return 'Корреляционная матрица';
        if (chart.type === 'category_count' || chart.type === 'numeric_hist') {
            return `Распределение: ${chart.data.column_name}`;
        }
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
                <div className="input-container">
                    <div className="input-box">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSendMessage()}
                            placeholder="Что исследуем?"
                        />
                        <button onClick={onSendMessage}>❯</button>
                    </div>
                </div>
            )}
        </div>
    );
};