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
    currentUser?: { username: string; id: number; plan_name?: string } | null;
    aiRequests?: number[];
    isBanned?: boolean;
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

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeChat, messages, loading, loadingPhrase,
    input, setInput, onSendMessage, localDataPool,
    dbSchema, onRefreshSchema, initialCharts = [], onRetry,
    currentUser, aiRequests = [], isBanned = false
}) => {
    const [useAi, setUseAi] = useState(false);
    const [removedCols, setRemovedCols] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFinTag, setIsFinTag] = useState(false);
    const [isDataTag, setIsDataTag] = useState(false);
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [isFinOpen, setIsFinOpen] = useState(false);
    const [chartsPayload, setChartsPayload] = useState<any[]>(initialCharts);

    const menuRef = useRef<HTMLDivElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Вычисляем, работаем ли мы сейчас с БД
    const isDbMode = !!dbSchema;

    // Стейт для показа ошибки и анимации
    const [showAiWarning, setShowAiWarning] = useState(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Стейт для тултипа "Только для middle / senior"
    const [isHoveredAi, setIsHoveredAi] = useState(false);
    const [isHoveredLimit, setIsHoveredLimit] = useState(false);

    const planName = currentUser?.plan_name || 'junior';

    // Умный обработчик клика по тумблеру
    const handleAiToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (planName === 'junior') return;

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
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setIsDataOpen(false);
                setIsFinOpen(false);
            }
        };

        if (isMenuOpen || isDataOpen || isFinOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, isDataOpen, isFinOpen]);

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
            disabled={loading || isBanned}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '28px', // Высота кнопки
                boxSizing: 'border-box',
                margin: '0',
                background: '#f0f4f8',
                border: '1px solid #dce4ec',
                borderRadius: '10px',
                padding: '0 8px',
                fontSize: '12px',
                lineHeight: '1',
                color: '#4a90e2',
                cursor: (loading || isBanned) ? 'not-allowed' : 'pointer',
                opacity: (loading || isBanned) ? 0.6 : 1,
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
        if (isBanned || !input.trim()) return;

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

    const renderProgressBar = () => {
        if (planName !== 'middle') return null;

        const count = aiRequests.length;
        let color = '#4caf50'; // green
        if (count == 2) color = '#ff9800'; // orange
        else if (count == 3) color = '#d32f2f'; // maroon/dark red

        const width = `${Math.min((count / 3) * 100, 100)}%`;

        return (
            <div
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '70px', marginTop: '2px', position: 'relative' }}
                onMouseEnter={() => setIsHoveredLimit(true)}
                onMouseLeave={() => setIsHoveredLimit(false)}
            >
                {isHoveredLimit && (
                    <div className="ai-db-tooltip" style={{ width: '220px', left: '-10px', bottom: 'calc(100% + 5px)', animation: 'none', opacity: 1, zIndex: 1000 }}>
                        Для подписки middle ограничение 3 запросов в минуту - для безлимита нужна подписка senior
                    </div>
                )}
                <div style={{ fontSize: '11px', color: '#666', marginRight: '6px', whiteSpace: 'nowrap', userSelect: 'none', transform: 'translateY(-2px)' }}>
                    {count}/3
                </div>
                <div style={{
                    height: '4px',
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: width,
                        backgroundColor: color,
                        transition: 'width 0.3s ease, background-color 0.3s ease'
                    }} />
                </div>
            </div>
        );
    };

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
                    // ИСПРАВЛЕНИЕ: Расширяем логику, чтобы фронт распознавал исторические SQL-блоки 
                    // (и подтвержденные агентом, и отклоненные юзером)
                    const isSqlValidation = msg.isSqlWaiting ||
                        (msg.text.includes("```sql") && (
                            msg.text.includes("нужно выполнить SQL запрос:") ||
                            msg.text.includes("Я исправил запрос:") ||
                            msg.text.includes("[STATUS: approve]") ||
                            msg.text.includes("[STATUS: reject]")
                        ));

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
                                        className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''} ${msg.isWarning ? 'warning' : ''}`}
                                        style={{ width: '100%' }}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text.replace(/\[[ФА]\]\s*/g, '')}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <div className={`msg-bubble markdown-body ${msg.sender} ${msg.isError ? 'error' : ''} ${msg.isWarning ? 'warning' : ''}`}>

                                    <div className="msg-bubble-inline">
                                        <div style={{ minWidth: 0 }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text.replace(/\[[ФА]\]\s*/g, '')}
                                            </ReactMarkdown>
                                        </div>

                                        {(msg.isError || msg.isWarning) && msg.retryData && (
                                            <button
                                                onClick={() => onRetry(msg.id, msg.retryData!)}
                                                style={{
                                                    flexShrink: 0,
                                                    width: '24px',
                                                    height: '24px',
                                                    background: 'transparent',
                                                    border: msg.isWarning ? '1px solid #ffc107' : '1px solid #d93025',
                                                    color: msg.isWarning ? '#b76c00' : '#d93025',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                    e.currentTarget.style.background = msg.isWarning ? '#ffc107' : '#d93025';
                                                    e.currentTarget.style.color = '#fff';
                                                }}
                                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = msg.isWarning ? '#b76c00' : '#d93025';
                                                }}
                                            >
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                                                    <path d="M3 3v5h5"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
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
                <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
            </div>

            {activeChat && activeChat !== "temp_loading" && (
                <div className="input-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', gap: '25px' }}>

                    {/* Левая часть - 10% */}
                    <div style={{ width: '10%', marginTop: '10px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>

                        {/* 3 строка - удаление столбцов */}
                        {allColumns.length > 0 && (
                            <div ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', marginBottom: '5px' }}>
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
                                        transition: 'all 0.4s ease',
                                        width: '100%',
                                        justifyContent: 'space-between'
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

                        {/* 1 строка - переключатель ai и лимиты */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                            <label
                                className="ai-toggle-container"
                                style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
                                onMouseEnter={() => setIsHoveredAi(true)}
                                onMouseLeave={() => setIsHoveredAi(false)}
                            >
                                {showAiWarning && (
                                    <div
                                        key={timeoutId ? timeoutId.toString() : 'tooltip'}
                                        className="ai-db-tooltip"
                                    >
                                        С БД нельзя работать без AI, так как агент будет составлять SQL запросы
                                    </div>
                                )}

                                {isHoveredAi && planName === 'junior' && !showAiWarning && (
                                    <div className="ai-db-tooltip">
                                        Только для middle / senior
                                    </div>
                                )}

                                <div className={`toggle-switch ${showAiWarning ? 'shake-animation' : ''} ${planName === 'junior' ? 'disabled' : ''}`} style={{ margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={isDbMode || useAi}
                                        onChange={handleAiToggle}
                                        disabled={loading || planName === 'junior'}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                                <span className="ai-toggle-label" style={{ userSelect: 'none', lineHeight: '1' }}>ai</span>
                            </label>

                            {renderProgressBar()}
                        </div>
                    </div>

                    {/* Правая часть - 90% */}
                    <div style={{ width: '90%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginTop: '13px' }}>

                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '15px', alignItems: 'flex-end', marginBottom: '10px' }}>
                            {/* Нижняя часть - поле ввода */}
                            <div className="input-box" style={{ flex: 1 }}>
                                <input
                                    value={input}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setInput(e.target.value);
                                    }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter' && !isBanned) {
                                            e.preventDefault();
                                            handleInputSend();
                                        }
                                    }}
                                    placeholder={isBanned ? "Действие недоступно (бан)" : "Что исследуем?"}
                                    disabled={isBanned || loading}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} ref={suggestionsRef}>
                                {!isDbMode && (
                                    <>
                                        <span style={{ fontSize: '11px', color: '#666', fontWeight: 500, paddingLeft: '4px' }}>Доступные команды</span>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 'calc(100% + 8px)',
                                                    right: 0,
                                                    background: '#fff',
                                                    border: isDataOpen ? '1px solid #dce4ec' : '0px solid transparent',
                                                    borderRadius: '12px',
                                                    boxShadow: isDataOpen ? '0 -4px 16px rgba(0,0,0,0.1)' : 'none',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    zIndex: 100,
                                                    maxHeight: isDataOpen ? '300px' : '0px',
                                                    opacity: isDataOpen ? 1 : 0,
                                                    overflowY: 'auto',
                                                    transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out, border 0.3s ease-in-out',
                                                    pointerEvents: isDataOpen ? 'auto' : 'none',
                                                    padding: isDataOpen ? '8px' : '0px',
                                                    minWidth: '220px'
                                                }}>
                                                    {dataAnalysisSuggestions.map((suggestion, idx) => renderSuggestionButton(suggestion, idx))}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setIsDataOpen(!isDataOpen);
                                                        if (isFinOpen) setIsFinOpen(false);
                                                    }}
                                                    style={{
                                                        background: isDataOpen ? '#e0f0ff' : '#f0f4f8',
                                                        border: '1px solid #dce4ec',
                                                        borderRadius: '10px',
                                                        padding: '0 16px',
                                                        height: '30px',
                                                        fontSize: '13px',
                                                        color: '#4a90e2',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Анализ данных
                                                </button>
                                            </div>

                                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 'calc(100% + 8px)',
                                                    right: 0,
                                                    background: '#fff',
                                                    border: isFinOpen ? '1px solid #dce4ec' : '0px solid transparent',
                                                    borderRadius: '12px',
                                                    boxShadow: isFinOpen ? '0 -4px 16px rgba(0,0,0,0.1)' : 'none',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    zIndex: 100,
                                                    maxHeight: isFinOpen ? '300px' : '0px',
                                                    opacity: isFinOpen ? 1 : 0,
                                                    overflowY: 'auto',
                                                    transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out, border 0.3s ease-in-out',
                                                    pointerEvents: isFinOpen ? 'auto' : 'none',
                                                    padding: isFinOpen ? '8px' : '0px',
                                                    minWidth: '220px'
                                                }}>
                                                    {financialAnalysisSuggestions.map((suggestion, idx) => renderSuggestionButton(suggestion, idx))}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setIsFinOpen(!isFinOpen);
                                                        if (isDataOpen) setIsDataOpen(false);
                                                    }}
                                                    style={{
                                                        background: isFinOpen ? '#e0f0ff' : '#f0f4f8',
                                                        border: '1px solid #dce4ec',
                                                        borderRadius: '10px',
                                                        padding: '0 16px',
                                                        height: '30px',
                                                        fontSize: '13px',
                                                        color: '#4a90e2',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: 600,
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Бизнес и финансы
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};