import React, { useState, useMemo, useRef, useEffect } from 'react';
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
    onSendMessage: (text?: string, useAi?: boolean, colsToRemove?: string[]) => void;
    localDataPool: any[];
}

const CHAT_SUGGESTIONS = [
    { label: 'Корреляционный анализ', action: 'send', text: 'Корреляционный анализ' },
    { label: 'Анализ столбцов', action: 'send', text: 'анализ столбцов' },
    { label: 'Аномалии', action: 'send', text: 'аномалии' },
    { label: 'Тренд', action: 'send', text: 'тренд' },
    { label: 'Важность признаков для ...', action: 'fill', text: 'важность признаков для __впишите название столбца__' },
    { label: 'Дерево признаков', action: 'send', text: 'дерево признаков' },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeChat, messages, loading, loadingPhrase,
    input, setInput, onSendMessage, localDataPool 
}) => {
    
    const [useAi, setUseAi] = useState(false);
    const [removedCols, setRemovedCols] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!isMenuOpen) setSearchQuery('');
    }, [isMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const allColumns = useMemo(() => {
        if (!localDataPool || localDataPool.length === 0) return [];
        return Object.keys(localDataPool[0]);
    }, [localDataPool]);

    const filteredColumns = useMemo(() => {
        if (!searchQuery.trim()) return allColumns;
        const lowerQuery = searchQuery.toLowerCase();
        return allColumns.filter(col => col.toLowerCase().includes(lowerQuery));
    }, [allColumns, searchQuery]);

    const handleToggleCol = (col: string) => {
        if (removedCols.includes(col)) {
            setRemovedCols(prev => prev.filter(c => c !== col));
        } else {
            if (removedCols.length >= allColumns.length - 1) {
                alert("Нельзя исключить все столбцы! Оставьте хотя бы один для анализа.");
                return;
            }
            setRemovedCols(prev => [...prev, col]);
        }
    };

    const handleSuggestionClick = (suggestion: typeof CHAT_SUGGESTIONS[0]) => {
        if (suggestion.action === 'send') {
            setInput(suggestion.text);      
            onSendMessage(suggestion.text, useAi, removedCols);
        } else if (suggestion.action === 'fill') {
            setInput(suggestion.text);      
        }
    };

    const getChartTitle = (chart: ChartData) => {
        const chartDef = CHART_REGISTRY[chart.type as keyof typeof CHART_REGISTRY];
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
                        
                        {CHAT_SUGGESTIONS.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start', padding: '0' }}>
                                {CHAT_SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        disabled={loading}
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
                                onKeyDown={e => e.key === 'Enter' && onSendMessage(undefined, useAi, removedCols)}
                                placeholder="Что исследуем?"
                                disabled={loading}
                            />
                            <button onClick={() => onSendMessage(undefined, useAi, removedCols)} disabled={loading}>❯</button>
                        </div>

                        {/* ИСПРАВЛЕНИЕ 1: flex-start удерживает верхний край контейнера неподвижным */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginTop: '2px'}}>
                            
                            {/* ИСПРАВЛЕНИЕ 2: Зафиксировали высоту тумблера, чтобы он идеально стоял по центру */}
                            <label className="ai-toggle-container" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', height: '28px' }}>
                                <div className="toggle-switch" style={{ margin: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={useAi} 
                                        onChange={(e) => setUseAi(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                                <span className="ai-toggle-label" style={{ userSelect: 'none', lineHeight: '1' }}>ai</span>
                            </label>

                            {allColumns.length > 0 && (
                                <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
                                    <button
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        disabled={loading}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start', // ИСПРАВЛЕНИЕ 3: текст "Убрать столбцы" не будет уезжать вниз
                                            background: isHovered ? '#ffffff' : '#fff3f3', 
                                            border: '1px solid #cd5c5c', 
                                            borderRadius: '20px',
                                            padding: '3px 6px 3px 12px', // Выверенные отступы для 28px
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                            color: '#000',
                                            fontSize: '12px',
                                            fontFamily: 'sans-serif',
                                            userSelect: 'none',
                                            minHeight: '28px', 
                                            transition: 'all 0.4s ease'
                                        }}
                                    >
                                        <span style={{ 
                                            fontWeight: 600, 
                                            whiteSpace: 'nowrap', 
                                            height: '20px', // Четко заданная высота строки
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            marginTop: '1px' // Идеальное центрирование относительно бейджа
                                        }}>
                                            Убрать столбцы
                                        </span>
                                        
                                        {/* ИСПРАВЛЕНИЕ 4: Анимация высоты и ширины с плавным перетеканием текста */}
                                        <div style={{
                                            borderRadius: isHovered && removedCols.length > 0 ? '10px' : '50%',
                                            minWidth: '20px',
                                            maxWidth: isHovered && removedCols.length > 0 ? '400px' : '20px',
                                            minHeight: '20px',
                                            maxHeight: isHovered && removedCols.length > 0 ? '20px' : '20px',
                                            padding: isHovered && removedCols.length > 0 ? '4px 10px' : '0px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            color: '#000',
                                            transition: 'all 0.6s ease',
                                            overflow: 'hidden', 
                                            whiteSpace: 'normal', // Сразу нормальный перенос (убирает микропрыжки при hover)
                                            wordBreak: 'break-word',
                                            textAlign: 'left',
                                            lineHeight: '1.2',
                                            marginTop: '1px'
                                        }}>
                                            <span style={{ minWidth: isHovered && removedCols.length > 0 ? 'max-content' : 'auto' }}>
                                                {isHovered && removedCols.length > 0 ? removedCols.join(' | ') : removedCols.length}
                                            </span>
                                        </div>
                                    </button>

                                    {isMenuOpen && !loading && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 'calc(100% + 10px)', 
                                            left: '0',
                                            background: '#fff',
                                            border: '1px solid #dce4ec',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)', 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            zIndex: 100,
                                            minWidth: '260px' // Сделали чуть шире для инпута
                                        }}>
                                            {/* ЗАФИКСИРОВАННАЯ ШАПКА С ПОИСКОМ */}
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                gap: '8px',
                                                borderBottom: '1px solid #f0f4f8',
                                                paddingBottom: '8px'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    Исключить из анализа:
                                                </div>
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Поиск..."
                                                    style={{
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        border: '1px solid #dce4ec',
                                                        borderRadius: '6px',
                                                        outline: 'none',
                                                        width: '80px',
                                                        flexGrow: 1,
                                                        background: '#f9fbfd'
                                                    }}
                                                />
                                            </div>

                                            {/* СКРОЛЛИРУЕМЫЙ СПИСОК СТОЛБЦОВ */}
                                            <div style={{
                                                maxHeight: '180px',
                                                overflowY: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                paddingRight: '4px' // Небольшой отступ для скроллбара
                                            }}>
                                                {filteredColumns.length > 0 ? (
                                                    filteredColumns.map(col => (
                                                        <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', margin: 0 }}>
                                                            <input
                                                                type="checkbox"
                                                                style={{ cursor: 'pointer' }}
                                                                checked={removedCols.includes(col)}
                                                                onChange={() => handleToggleCol(col)}
                                                            />
                                                            <span style={{ wordBreak: 'break-word' }}>{col}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', padding: '10px 0' }}>
                                                        Колонки не найдены
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};