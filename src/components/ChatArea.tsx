import React from 'react';
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
    
    // Функция для получения названия графика
    const getChartTitle = (chart: ChartData) => {
        if (chart.type === 'correlation') return 'Корреляционная матрица';
        if (chart.type === 'column_stats') {
            const catCols = Object.keys(chart.data?.categorical || {});
            return catCols.length > 0 ? `Распределение: ${catCols[0]}` : 'Статистика';
        }
        return 'График';
    };

    return (
        <div className="col-center">
            <div className="messages-wrapper">
                {activeChat && activeChat !== "temp_loading" && localDataPool.length > 0 && (
                    <SampleTable dataPool={localDataPool} />
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`msg-row ${msg.sender}`}>
                        
                        {/* Если это агент и у него есть графики, оборачиваем в div с заголовком */}
                        {msg.sender === 'agent' && msg.charts && msg.charts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', width: '66.66%' }}>
                                <div style={{ 
                                    fontSize: '13px', 
                                    fontStyle: 'italic', 
                                    color: '#666', 
                                    marginBottom: '6px', 
                                    marginLeft: '15px' 
                                }}>
                                    {msg.charts.map(c => `Добавлен новый график: ${getChartTitle(c)}`).join(' | ')}
                                </div>
                                <div className={`msg-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`} style={{ width: '100%' }}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>{line}<br/></React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Обычный рендер для юзера или агента без графиков */
                            <div className={`msg-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                {msg.text.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>{line}<br/></React.Fragment>
                                ))}
                            </div>
                        )}

                    </div>
                ))}

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