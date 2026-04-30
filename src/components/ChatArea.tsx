import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChartData } from '../types';
import { SampleTable } from './SampleTable';
import { CHART_REGISTRY } from '../chartRegistry';

interface ChatAreaProps {
    activeChat: string | null;
    messages: Message[];
    loading: boolean;
    loadingPhrase: string;
    input: string;
    setInput: (val: string) => void;
    onSendMessage: (text?: string, useAi?: boolean) => void;
    localDataPool: any[];
}

// Зашиваем красивые подсказки прямо на фронтенде
const CHAT_SUGGESTIONS = [
    { label: 'Корреляционный анализ', action: 'send', text: 'Корреляционный анализ' },
    // { label: 'Корреляционная матрица', action: 'send', text: 'корреляционная матрица' },
    { label: 'Анализ столбцов', action: 'send', text: 'анализ столбцов' },
    { label: 'Аномалии', action: 'send', text: 'аномалии' },
    // { label: 'Кросс-зависимости', action: 'send', text: 'кросс-зависимости' },
    { label: 'Тренд', action: 'send', text: 'тренд' },
    { label: 'Важность признаков для ...', action: 'fill', text: 'важность признаков для __впишите название столбца__' },
    /*{ 
        label: 'Зависимость признаков', 
        action: 'fill', 
        text: 'зависимость _впишите название столбца_ от _впишите название другого столбца_' 
    },*/
    // { label: 'Матрица рассеяния', action: 'send', text: 'матрица рассеяния' },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeChat, messages, loading, loadingPhrase,
    input, setInput, onSendMessage, localDataPool 
}) => {
    
    // 1. ДОБАВЛЯЕМ СОСТОЯНИЕ ДЛЯ TOGGLE (по умолчанию включен)
    const [useAi, setUseAi] = React.useState(false);

    // 2. ОБНОВЛЯЕМ ВЫЗОВ В ПОДСКАЗКАХ
    const handleSuggestionClick = (suggestion: typeof CHAT_SUGGESTIONS[0]) => {
        if (suggestion.action === 'send') {
            setInput(suggestion.text);      
            onSendMessage(suggestion.text, useAi);
        } else if (suggestion.action === 'fill') {
            setInput(suggestion.text);      
        }
    };

    const getChartTitle = (chart: ChartData) => {
    // Достаем конфиг для конкретного типа графика
        const chartDef = CHART_REGISTRY[chart.type as keyof typeof CHART_REGISTRY];
        
        // Если конфиг найден, вызываем функцию для чата, иначе фоллбэк
        return chartDef ? chartDef.chatTitle(chart.data) : 'График';
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
                                <div style={{ display: 'flex', flexDirection: 'column', width: '73%' }}>
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
                    
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '-10px' }}>
                        
                        {/* Отрисовка кнопок-подсказок */}
                        {CHAT_SUGGESTIONS.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start', padding: '0' }}>
                                {CHAT_SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        disabled={loading} // Не даем кликать во время загрузки
                                        onClick={() => handleSuggestionClick(suggestion)}
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
                                        {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="input-box" style={{ width: '100%', margin: '0' }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                // 3. ОБНОВЛЯЕМ ВЫЗОВ ПРИ НАЖАТИИ ENTER
                                onKeyDown={e => e.key === 'Enter' && onSendMessage(undefined, useAi)}
                                placeholder="Что исследуем?"
                                disabled={loading}
                            />
                            {/* 4. ОБНОВЛЯЕМ ВЫЗОВ ПРИ КЛИКЕ НА КНОПКУ */}
                            <button onClick={() => onSendMessage(undefined, useAi)} disabled={loading}>❯</button>
                        </div>

                        {/* 5. НОВЫЙ ЭЛЕМЕНТ: Переключатель AI */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '8px', marginLeft: '8px' }}>
                            <label className="ai-toggle-container" style={{ margin: 0 }}>
                                <div className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={useAi} 
                                        onChange={(e) => setUseAi(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                                <span className="ai-toggle-label">ai</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};