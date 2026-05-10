import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChartData } from '../../types';
import { SampleTable } from './data_preview/SampleTable';
import { CHART_REGISTRY } from '../../chartRegistry';
import { ERDDiagram, DBTable, DBRelation } from './data_preview/ERDDiagram';
import { SqlValidationBlock } from './SQLValidation';

interface ChatAreaProps {
    activeChat: string | null;
    messages: Message[];
    loading: boolean;
    loadingPhrase: string;
    input: string;
    setInput: (val: string) => void;
    onSendMessage: (text?: string, useAi?: boolean, colsToRemove?: string[], sqlAction?: 'approve' | 'reject', sqlFeedback?: string, sqlQuery?: string) => void;
    localDataPool: any[];
    dbSchema?: { tables: DBTable[], relations: DBRelation[] } | null;
    onRefreshSchema?: () => Promise<any>;
    initialCharts?: any[];
    onRetry: (msgId: string, retryData: any) => void;
}

const CHAT_SUGGESTIONS = [
    { label: 'Корреляционный анализ', action: 'send', text: '[А] Корреляционный анализ' },
    { label: 'Анализ столбцов', action: 'send', text: '[А] анализ столбцов' },
    { label: 'Аномалии', action: 'send', text: '[А] аномалии' },
    { label: 'Тренд', action: 'send', text: '[А] тренд' },
    { label: 'Важность признаков для ...', action: 'fill', text: '[А] важность признаков для __впишите название столбца__' },
    { label: 'Дерево признаков', action: 'send', text: '[А] дерево признаков' },
    { label: 'Cash Flow', action: 'fill', text: '[Ф] денежный поток Дата Сумма' },
    { label: 'P&L', action: 'fill', text: '[Ф] pnl Сумма' },
    { label: 'Структура расходов', action: 'fill', text: '[Ф] структура расходов Категория Сумма' },
    { label: 'ABC-анализ', action: 'fill', text: '[Ф] abc-анализ Категория Сумма' },
    { label: 'Юнит-экономика', action: 'fill', text: '[Ф] юнит-экономика Источник_трафика Сумма CAC_Стоимость_привлечения Пользователь_ID' },
    { label: 'Прогноз выручки', action: 'fill', text: '[Ф] прогноз выручки Дата Сумма' },
    { label: 'Когортный анализ', action: 'fill', text: '[Ф] когортный анализ Дата Пользователь_ID' },
];

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', color: '#666' }}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeChat, messages, loading, loadingPhrase,
    input, setInput, onSendMessage, localDataPool,
    dbSchema, onRefreshSchema, initialCharts = [], onRetry
}) => {
    const [useAi, setUseAi] = useState(false);
    const [removedCols, setRemovedCols] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFinTag, setIsFinTag] = useState(false);
    const [isDataTag, setIsDataTag] = useState(false);
    const [isDataOpen, setIsDataOpen] = useState(true);
    const [isFinOpen, setIsFinOpen] = useState(true);
    const [chartsPayload, setChartsPayload] = useState<any[]>(initialCharts);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Вычисляем, работаем ли мы сейчас с БД
    const isDbMode = !!dbSchema; 
    
    // Стейт для показа ошибки и анимации
    // Добавь эти два стейта в начале компонента ChatArea (или там, где у тебя переключатель)
    const [showAiWarning, setShowAiWarning] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Умный обработчик клика по тумблеру
    const handleAiToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDbMode) {
            setShowAiWarning(true);
            
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            // Ставим таймер ровно на 5100 мс (5.1 секунды)
            const newTimeout = setTimeout(() => {
                setShowAiWarning(false);
            }, 5100); 
            
            setTimeoutId(newTimeout);
            return;
        }
        setUseAi(e.target.checked);
    };

    useEffect(() => {
        setChartsPayload(initialCharts);
    }, [initialCharts]);

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
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            if (container) {
                const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
                
                if (distance > 0) {
                    // Браузерный smooth scroll отрабатывает в среднем за 0.5-1 сек, что идеально укладывается в твои "максимум 2 секунды".
                    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
    }, [messages, activeChat]); // Срабатывает при смене чата или новом сообщении

    const allColumns = useMemo(() => {
        if (dbSchema) return dbSchema.tables.flatMap(t => t.columns.map(c => c.name));
        if (!localDataPool || localDataPool.length === 0) return [];
        return Object.keys(localDataPool[0]);
    }, [localDataPool, dbSchema]);

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
        const hasFinTag = suggestion.text.includes('[Ф]');
        const hasDataTag = suggestion.text.includes('[А]');
        
        const cleanText = suggestion.text.replace(/\[[ФА]\]\s*/g, ''); 

        if (suggestion.action === 'send') {
            setInput(''); 
            // ИСПРАВЛЕНО: передаем isDbMode || useAi
            onSendMessage(suggestion.text, isDbMode || useAi, removedCols); 
        } else if (suggestion.action === 'fill') {
            setInput(cleanText); 
            setIsFinTag(hasFinTag); 
            setIsDataTag(hasDataTag); 
        }
    };

    const getChartTitle = (chart: ChartData) => {
        const chartDef = CHART_REGISTRY[chart.type as keyof typeof CHART_REGISTRY];
        return chartDef ? chartDef.chatTitle(chart.data) : 'График';
    };

    const dataAnalysisSuggestions = CHAT_SUGGESTIONS.filter(s => !s.text.includes('[Ф]'));
    const financialAnalysisSuggestions = CHAT_SUGGESTIONS.filter(s => s.text.includes('[Ф]'));

    const renderSuggestionButton = (suggestion: typeof CHAT_SUGGESTIONS[0], index: number) => (
        <button
            key={index}
            disabled={loading}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '20px', // Высота кнопки
                boxSizing: 'border-box',
                margin: '0',
                background: '#f0f4f8',
                border: '1px solid #dce4ec',
                borderRadius: '10px',
                padding: '0 8px',
                fontSize: '12px',
                lineHeight: '1', 
                color: '#4a90e2',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0 
            }}
            onMouseEnter={e => {
                if (!loading) {
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
    );

    const handleInputSend = () => {
        if (!input.trim()) return;
        
        let textToSend = input;
        if (isFinTag) textToSend = `[Ф] ${input}`;
        else if (isDataTag) textToSend = `[А] ${input}`; 
        
        // ИСПРАВЛЕНО: передаем isDbMode || useAi
        onSendMessage(textToSend, isDbMode || useAi, removedCols);
        setInput('');
        setIsFinTag(false);
        setIsDataTag(false); 
    };

    // Собираем категории подсказок в массив, чтобы отрендерить их циклом
    const suggestionRows = [
        {
            id: 'data',
            title: 'Анализ данных',
            items: dataAnalysisSuggestions,
            isOpen: isDataOpen,
            toggle: () => setIsDataOpen(!isDataOpen)
        },
        {
            id: 'fin',
            title: 'Бизнес и финансы',
            items: financialAnalysisSuggestions,
            isOpen: isFinOpen,
            toggle: () => setIsFinOpen(!isFinOpen)
        }
    ].filter(row => row.items.length > 0); // Оставляем только те, где есть подсказки

    return (
        <div className="col-center" style={{ overflowY: 'auto' }}>
            <div className="messages-wrapper">
                {activeChat && activeChat !== "temp_loading" && (
                    dbSchema ? (
                        <ERDDiagram
                            tables={dbSchema.tables} 
                            relations={dbSchema.relations} 
                            onRefresh={onRefreshSchema}
                        />
                    ) : localDataPool.length > 0 ? (
                        <SampleTable dataPool={localDataPool} />
                    ) : null
                )}

                {messages.map(msg => {
                    const isSqlValidation = msg.isSqlWaiting || (msg.sender === 'agent' && msg.text.includes("```sql") && msg.text.includes("нужно выполнить SQL запрос:"));
                    let chartNotification = null;

                    if (msg.sender === 'agent' && msg.charts && msg.charts.length > 0) {
                        const chartNames = msg.charts.map(c => getChartTitle(c)).join(', ');
                        const isMultiple = msg.charts.length > 1;
                        chartNotification = isMultiple ? `Добавлены новые графики: ${chartNames}` : `Добавлен новый график: ${chartNames}`;
                    }

                    return (
                        <div key={msg.id} className={`msg-row ${msg.sender}`}>
                            {isSqlValidation ? (
                                <div
                                    className={`msg-bubble ${msg.sender}`}
                                    style={{
                                        width: '73%', padding: '16px 20px', background: '#ffffff',
                                        border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <SqlValidationBlock 
                                        text={msg.text} 
                                        onAction={(action: 'approve' | 'reject', feedbackText?: string, editedQuery?: string) => {
                                            // ИСПРАВЛЕНО: передаем isDbMode || useAi
                                            onSendMessage('', isDbMode || useAi, removedCols, action, feedbackText, editedQuery);
                                        }}
                                    />
                                </div>
                            ) : chartNotification ? (
                                <div style={{ display: 'flex', flexDirection: 'column', width: '73%' }}>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontStyle: 'italic',
                                            color: '#666',
                                            marginBottom: '6px',
                                            marginLeft: '15px',
                                            width: '100%',
                                            whiteSpace: 'normal',
                                            wordWrap: 'break-word',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        {chartNotification}
                                    </div>

                                    <div
                                        className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''}`}
                                        style={{ width: '100%' }}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text.replace(/\[[ФА]\]\s*/g, '')}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text.replace(/\[[ФА]\]\s*/g, '')}
                                    </ReactMarkdown>
                                    
                                    {/* КНОПКА ПОВТОРА ПРИ ОШИБКЕ */}
                                    {msg.isError && msg.retryData && (
                                        <button 
                                            onClick={() => onRetry(msg.id, msg.retryData!)}
                                            style={{
                                                marginTop: '12px',
                                                padding: '6px 14px',
                                                background: 'transparent',
                                                border: '1px solid #d93025', // Твой COLORS.errorBorder
                                                color: '#d93025',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: 600,
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = '#d93025';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#d93025';
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                                <path d="M3 3v5h5"></path>
                                            </svg>
                                            Перезапустить запрос
                                        </button>
                                    )}
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
                <div ref={messagesEndRef} style={{ float:"left", clear: "both" }} />
            </div>

            {activeChat && activeChat !== "temp_loading" && (
            <div className="input-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    
                    {suggestionRows.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                            {suggestionRows.map((row, index) => (
                                <React.Fragment key={row.id}>
                                    {/* СТРОКА С ПОДСКАЗКАМИ: строго 16px */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        width: '100%',
                                        height: row.isOpen? '32px' : '22px',
                                    }}>
                                        <div 
                                            onClick={row.toggle}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', cursor: 'pointer', 
                                                userSelect: 'none', marginRight: '10px', flexShrink: 0
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px', height: '20px' }}>
                                                <ChevronIcon isOpen={row.isOpen}/>
                                            </span>
                                            <span style={{ 
                                                display: 'flex', alignItems: 'center',
                                                height: '16px', fontSize: '12px',
                                                color: '#999', fontStyle: 'italic', whiteSpace: 'nowrap', 
                                                lineHeight: '1', 
                                            }}>
                                                {row.title}
                                            </span>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                            overflow: 'hidden', 
                                            maxWidth: row.isOpen ? '2000px' : '0px', 
                                            opacity: row.isOpen ? 1 : 0,
                                            transition: 'max-width 0.4s ease-in-out, opacity 0.3s ease-in-out',
                                            whiteSpace: 'nowrap',
                                            flexWrap: 'nowrap'
                                        }}>
                                            {row.items.map((suggestion, idx) => renderSuggestionButton(suggestion, idx))}
                                        </div>
                                    </div>

                                    {/* РАЗДЕЛИТЕЛЬ: отступы по 6px для симметрии */}
                                    {index < suggestionRows.length - 1 && (
                                        <div style={{ 
                                            width: '100%', height: '1px', 
                                            background: '#e2e8ee'
                                        }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    
                    {/* Поле ввода с верхним отступом 6px, чтобы соответствовать логике разделителей */}
                    <div className="input-box" style={{ width: '100%', marginBottom: '10px' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Что исследуем?"
                        />
                    </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '10px'}}>
                            
                            <label 
                                className="ai-toggle-container" // Убрали анимацию отсюда
                                style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', height: '28px', position: 'relative' }}
                            >
                                {/* Всплывающая подсказка */}
                                {showAiWarning && (
                                    <div 
                                        key={timeoutId ? timeoutId.toString() : 'tooltip'} 
                                        className="ai-db-tooltip"
                                    >
                                        С БД нельзя работать без AI, так как агент будет составлять SQL запросы
                                    </div>
                                )}

                                {/* Добавили класс анимации именно сюда, к самому переключателю */}
                                <div className={`toggle-switch ${showAiWarning ? 'shake-animation' : ''}`} style={{ margin: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        // Если мы в режиме БД, тумблер ВСЕГДА включен визуально
                                        checked={isDbMode || useAi} 
                                        onChange={handleAiToggle}
                                        // Обрати внимание: мы НЕ блокируем кнопку через disabled={isDbMode}, 
                                        // иначе пользователь не сможет по ней кликнуть и увидеть тултип.
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
                                            alignItems: 'flex-start',
                                            background: isHovered ? '#ffffff' : '#fff3f3', 
                                            border: '1px solid #cd5c5c', 
                                            borderRadius: '20px',
                                            padding: '3px 6px 3px 12px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                            color: '#000',
                                            fontSize: '12px',
                                            fontFamily: 'sans-serif',
                                            userSelect: 'none',
                                            height: '28px', 
                                            transition: 'all 0.4s ease'
                                        }}
                                    >
                                        <span style={{ 
                                            fontWeight: 600, 
                                            whiteSpace: 'nowrap', 
                                            height: '20px',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            marginTop: '1px'
                                        }}>
                                            Убрать столбцы
                                        </span>
                                        
                                        <div style={{
                                            borderRadius: isHovered && removedCols.length > 0 ? '10px' : '50%',
                                            minWidth: '20px',
                                            maxWidth: isHovered && removedCols.length > 0 ? '400px' : '20px',
                                            height: '20px',
                                            maxHeight: isHovered && removedCols.length > 0 ? '20px' : '20px',
                                            padding: isHovered && removedCols.length > 0 ? '4px 10px' : '0px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            color: '#000',
                                            transition: 'all 0.6s ease',
                                            overflow: 'hidden', 
                                            whiteSpace: 'normal',
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
                                            minWidth: '260px'
                                        }}>
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

                                            <div style={{
                                                maxHeight: '180px',
                                                overflowY: 'auto',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                paddingRight: '4px'
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