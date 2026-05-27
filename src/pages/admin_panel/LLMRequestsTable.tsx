import React, { useEffect, useState } from 'react';
import { COLORS } from '../../globasStyles';

export interface LLMRequest {
    request_id: string;
    user_id: number;
    chat_id: string;
    input_text: string;
    input_tokens: number;
    output_tokens: number;
    request_status: number;
    model_name: string;
    created_at: string;
    duration_ms: number;
    initiator: string;
    used_tool?: string;
    error_message: string;
}

export const REQUEST_COLUMNS = [
    { key: 'request_id', label: 'ID запроса' },
    { key: 'user_id', label: 'ID юзера' },
    { key: 'chat_id', label: 'ID чата' },
    { key: 'input_text', label: 'Запрос' },
    { key: 'input_tokens', label: 'Вх. токены' },
    { key: 'output_tokens', label: 'Исх. токены' },
    { key: 'request_status', label: 'Статус' },
    { key: 'model_name', label: 'Модель' },
    { key: 'created_at', label: 'Создан' },
    { key: 'duration_ms', label: 'Длительность' },
    { key: 'initiator', label: 'Инициатор' },
    { key: 'used_tool', label: 'Инструмент' },
    { key: 'error_message', label: 'Ошибка' }
];

export const formatDuration = (ms: number): string => {
    if (ms === undefined || ms === null) return '-';
    if (ms < 1000) {
        return `${ms} мс`;
    }
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

    if (minutes > 0) {
        return `${minutes} мин. ${seconds} сек.`;
    } else {
        if (milliseconds > 0) {
            return `${seconds} сек. ${milliseconds} мс`;
        }
        return `${seconds} сек.`;
    }
};

export const LLMRequestsTable: React.FC = () => {
    const [requests, setRequests] = useState<LLMRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const limit = 10;

    const [sortCol, setSortCol] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    const [filterCol, setFilterCol] = useState<string | null>(null);
    const [filterVal, setFilterVal] = useState<string>('');
    const [activeFilterInputs, setActiveFilterInputs] = useState<{ [key: string]: boolean }>({});
    const [filterInputs, setFilterInputs] = useState<{ [key: string]: string }>({});
    const [collapsedCols, setCollapsedCols] = useState<{ [key: string]: boolean }>({});

    const [hoveredHeader, setHoveredHeader] = useState<{
        colKey: string;
        rect: DOMRect;
    } | null>(null);

    const [hoverTimeoutId, setHoverTimeoutId] = useState<any>(null);
    const [statsData, setStatsData] = useState<any | null>(null);

    const fetchRequestsStats = async () => {
        try {
            const res = await fetch('http://localhost:8001/admin/llm_requests/stats');
            if (res.ok) {
                const data = await res.json();
                setStatsData(data);
            }
        } catch (err) {
            console.error('Не удалось загрузить статистику логов', err);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (page - 1) * limit;
            let url = `http://localhost:8001/admin/llm_requests?limit=${limit}&offset=${offset}&sort_col=${sortCol}&sort_order=${sortOrder}`;
            if (filterCol && filterVal) {
                url += `&filter_col=${filterCol}&filter_val=${encodeURIComponent(filterVal)}`;
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Не удалось загрузить логи llm_requests');
            }
            const data = await res.json();
            setRequests(data.data || []);
            setTotal(data.total || 0);
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при загрузке');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchRequestsStats();
    }, [page, sortCol, sortOrder, filterCol, filterVal]);

    const handleSort = (colKey: string) => {
        if (sortCol === colKey) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortCol(colKey);
            setSortOrder('DESC');
        }
        setPage(1);
    };

    const toggleFilterInput = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const toggleCollapse = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCollapsedCols(prev => ({
            ...prev,
            [colKey]: !prev[colKey]
        }));
    };

    const handleFilterChange = (colKey: string, val: string) => {
        setFilterInputs(prev => ({
            ...prev,
            [colKey]: val
        }));
    };

    const applyFilter = (colKey: string) => {
        const val = filterInputs[colKey] || '';
        if (val.trim() === '') {
            setFilterCol(null);
            setFilterVal('');
        } else {
            setFilterCol(colKey);
            setFilterVal(val);
        }
        setPage(1);
    };

    const clearFilter = (colKey: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFilterInputs(prev => ({
            ...prev,
            [colKey]: ''
        }));
        if (filterCol === colKey) {
            setFilterCol(null);
            setFilterVal('');
        }
        setActiveFilterInputs(prev => ({
            ...prev,
            [colKey]: false
        }));
        setPage(1);
    };

    const getCellStyle = (colKey: string, customStyles: React.CSSProperties = {}): React.CSSProperties => {
        const isCollapsed = collapsedCols[colKey];
        if (isCollapsed) {
            return {
                ...customStyles,
                maxWidth: '0px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            };
        }
        return customStyles;
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <>
            {error && (
                <div style={{
                    background: COLORS.errorBg,
                    border: `1px solid ${COLORS.errorBorder}`,
                    color: '#c5221f',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    maxWidth: '1400px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {error}
                </div>
            )}
            <div className="table-wrapper" style={{ overflowX: 'auto', maxHeight: '60vh', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
                <style>{`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}</style>
                {loading && requests.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite linear',
                        zIndex: 10
                    }} />
                )}
                <table className="sample-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {REQUEST_COLUMNS.map(col => {
                                const isSorted = sortCol === col.key;
                                const isFiltered = filterCol === col.key && filterVal !== '';
                                const showInput = activeFilterInputs[col.key];
                                const isCollapsed = collapsedCols[col.key];
                                const shouldHover = ['input_tokens', 'output_tokens', 'duration_ms', 'model_name', 'initiator', 'request_status', 'used_tool'].includes(col.key);

                                return (
                                    <th
                                        key={col.key}
                                        onMouseEnter={(e) => {
                                            if (shouldHover) {
                                                if (hoverTimeoutId) {
                                                    clearTimeout(hoverTimeoutId);
                                                    setHoverTimeoutId(null);
                                                }
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setHoveredHeader({ colKey: col.key, rect });
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (shouldHover) {
                                                const timeout = setTimeout(() => {
                                                    setHoveredHeader(null);
                                                }, 200);
                                                setHoverTimeoutId(timeout);
                                            }
                                        }}
                                        style={{
                                            padding: '12px 16px',
                                            userSelect: 'none',
                                            position: 'relative',
                                            whiteSpace: 'nowrap',
                                            width: isCollapsed ? '1px' : undefined,
                                            cursor: shouldHover ? 'help' : undefined
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <span
                                                    onClick={() => handleSort(col.key)}
                                                    style={{ cursor: 'pointer', flex: 1, fontWeight: 600 }}
                                                >
                                                    {col.label}
                                                </span>

                                                {/* Иконки схлопывания, сортировки и фильтра */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span
                                                        onClick={(e) => toggleCollapse(col.key, e)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: isCollapsed ? COLORS.accent : COLORS.gray400,
                                                            display: 'inline-flex',
                                                            padding: '2px',
                                                            borderRadius: '4px',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title={isCollapsed ? "Развернуть столбец" : "Свернуть столбец"}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            {isCollapsed ? (
                                                                <>
                                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                                    <polyline points="9 21 3 21 3 15"></polyline>
                                                                    <line x1="21" y1="3" x2="14" y2="10"></line>
                                                                    <line x1="3" y1="21" x2="10" y2="14"></line>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <polyline points="4 14 10 14 10 20"></polyline>
                                                                    <polyline points="20 10 14 10 14 4"></polyline>
                                                                    <line x1="14" y1="10" x2="21" y2="3"></line>
                                                                    <line x1="10" y1="14" x2="3" y2="21"></line>
                                                                </>
                                                            )}
                                                        </svg>
                                                    </span>

                                                    <span
                                                        onClick={() => handleSort(col.key)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: isSorted ? COLORS.accent : COLORS.gray400,
                                                            fontSize: '11px',
                                                            display: 'inline-flex'
                                                        }}
                                                        title="Сортировать"
                                                    >
                                                        {isSorted ? (sortOrder === 'ASC' ? '▲' : '▼') : '↕'}
                                                    </span>

                                                    <span
                                                        onClick={(e) => toggleFilterInput(col.key, e)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: isFiltered ? COLORS.accent_brighter : COLORS.gray400,
                                                            display: 'inline-flex'
                                                        }}
                                                        title="Фильтровать"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill={isFiltered ? COLORS.accent : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>

                                            {showInput && (
                                                <div
                                                    onClick={e => e.stopPropagation()}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        marginTop: '6px'
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={filterInputs[col.key] || ''}
                                                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && applyFilter(col.key)}
                                                        placeholder="Поиск..."
                                                        style={{
                                                            width: '100px',
                                                            padding: '4px 8px',
                                                            fontSize: '12px',
                                                            border: `1.5px solid ${COLORS.gray200}`,
                                                            borderRadius: '0px',
                                                            outline: 'none',
                                                            fontFamily: 'inherit'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => applyFilter(col.key)}
                                                        style={{
                                                            padding: '4px 6px',
                                                            background: COLORS.dark,
                                                            color: COLORS.white,
                                                            border: 'none',
                                                            borderRadius: '0px',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        ОК
                                                    </button>
                                                    <button
                                                        onClick={(e) => clearFilter(col.key, e)}
                                                        style={{
                                                            padding: '4px 6px',
                                                            background: '#f1f5f9',
                                                            color: '#334155',
                                                            border: 'none',
                                                            borderRadius: '0px',
                                                            cursor: 'pointer',
                                                            fontSize: '10px',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        Х
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && requests.length === 0 ? (
                            <tr>
                                <td colSpan={REQUEST_COLUMNS.length} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="loading-text">Загрузка логов...</div>
                                </td>
                            </tr>
                        ) : requests.length === 0 ? (
                            <tr>
                                <td colSpan={REQUEST_COLUMNS.length} style={{ textAlign: 'center', padding: '40px', color: COLORS.gray500 }}>
                                    Записи не найдены
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.request_id} style={{
                                    opacity: loading ? 0.6 : 1,
                                    pointerEvents: loading ? 'none' : 'auto',
                                    transition: 'opacity 0.15s ease'
                                }}>
                                    <td style={getCellStyle('request_id', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={req.request_id}>
                                        {req.request_id}
                                    </td>
                                    <td style={getCellStyle('user_id', { padding: '12px 16px', fontSize: '13px' })} title={String(req.user_id)}>
                                        {req.user_id}
                                    </td>
                                    <td style={getCellStyle('chat_id', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray600, fontFamily: 'monospace' })} title={req.chat_id || ''}>
                                        {req.chat_id || '-'}
                                    </td>
                                    <td style={getCellStyle('input_text', {
                                        padding: '12px 16px',
                                        fontSize: '13px',
                                        maxWidth: '250px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    })} title={req.input_text}>
                                        {req.input_text}
                                    </td>
                                    <td style={getCellStyle('input_tokens', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.input_tokens || 0)}>
                                        {req.input_tokens || 0}
                                    </td>
                                    <td style={getCellStyle('output_tokens', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.output_tokens || 0)}>
                                        {req.output_tokens || 0}
                                    </td>
                                    <td style={getCellStyle('request_status', { padding: '12px 16px', fontSize: '13px', textAlign: 'center' })} title={String(req.request_status)}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '0px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            background: req.request_status === 200 ? '#e6f4ea' : '#fce8e6',
                                            color: req.request_status === 200 ? '#137333' : '#c5221f'
                                        }}>
                                            {req.request_status}
                                        </span>
                                    </td>
                                    <td style={getCellStyle('model_name', { padding: '12px 16px', fontSize: '13px' })} title={req.model_name || ''}>
                                        {req.model_name || '-'}
                                    </td>
                                    <td style={getCellStyle('created_at', { padding: '12px 16px', fontSize: '13px', color: COLORS.gray500 })} title={req.created_at ? new Date(req.created_at).toLocaleString('ru-RU') : ''}>
                                        {req.created_at ? new Date(req.created_at).toLocaleString('ru-RU') : '-'}
                                    </td>
                                    <td style={getCellStyle('duration_ms', { padding: '12px 16px', fontSize: '13px', textAlign: 'right' })} title={String(req.duration_ms)}>
                                        {formatDuration(req.duration_ms)}
                                    </td>
                                    <td style={getCellStyle('initiator', { padding: '12px 16px', fontSize: '13px' })} title={req.initiator}>
                                        {req.initiator}
                                    </td>
                                    <td style={getCellStyle('used_tool', { padding: '12px 16px', fontSize: '13px' })} title={req.used_tool || ''}>
                                        {req.used_tool || '-'}
                                    </td>
                                    <td style={getCellStyle('error_message', {
                                        padding: '12px 16px',
                                        fontSize: '13px',
                                        maxWidth: '200px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: '#c5221f'
                                    })} title={req.error_message || ''}>
                                        {req.error_message || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Пагинация LLM-запросов */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderTop: `1px solid ${COLORS.gray200}`,
                background: COLORS.gray50
            }}>
                <span style={{ fontSize: '14px', color: COLORS.gray600 }}>
                    Показано с {total === 0 ? 0 : (page - 1) * limit + 1} по {Math.min(page * limit, total)} из {total} записей
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--card-bg)',
                            border: `1px solid var(--border-color)`,
                            borderRadius: '0px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--fg-color)',
                            opacity: page === 1 ? 0.5 : 1
                        }}
                    >
                        «
                    </button>
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--card-bg)',
                            border: `1px solid var(--border-color)`,
                            borderRadius: '0px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--fg-color)',
                            opacity: page === 1 ? 0.5 : 1
                        }}
                    >
                        Назад
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fg-color)', padding: '0 8px', fontFamily: 'var(--font-mono)' }}>
                        Страница {page} из {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--card-bg)',
                            border: `1px solid var(--border-color)`,
                            borderRadius: '0px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--fg-color)',
                            opacity: page === totalPages ? 0.5 : 1
                        }}
                    >
                        Вперед
                    </button>
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--card-bg)',
                            border: `1px solid var(--border-color)`,
                            borderRadius: '0px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--fg-color)',
                            opacity: page === totalPages ? 0.5 : 1
                        }}
                    >
                        »
                    </button>
                </div>
            </div>

            {/* Всплывающие карточки статистики при ховере на заголовки логов LLM */}
            {hoveredHeader && statsData && (() => {
                const { colKey, rect } = hoveredHeader;
                const stats = statsData[colKey];
                if (!stats) return null;

                const isNumeric = ['input_tokens', 'output_tokens', 'duration_ms'].includes(colKey);
                const colLabel = REQUEST_COLUMNS.find(c => c.key === colKey)?.label || '';

                const top = rect.bottom + window.scrollY / 4;
                const left = rect.left + window.scrollX + (rect.width / 2) - 130;

                const formatDurationStats = (ms: number): string => {
                    if (ms === 0) return '0 сек.';
                    if (ms < 1000) return `${ms.toFixed(0)} мс`;
                    const totalSec = ms / 1000;
                    if (totalSec < 60) {
                        return `${totalSec.toFixed(1)} сек.`;
                    }
                    const min = Math.floor(totalSec / 60);
                    const sec = Math.round(totalSec % 60);
                    if (sec === 0) return `${min} мин.`;
                    return `${min} мин. ${sec} сек.`;
                };

                return (
                    <div
                        onMouseEnter={() => {
                            if (hoverTimeoutId) {
                                clearTimeout(hoverTimeoutId);
                                setHoverTimeoutId(null);
                            }
                        }}
                        onMouseLeave={() => {
                            const timeout = setTimeout(() => {
                                setHoveredHeader(null);
                            }, 200);
                            setHoverTimeoutId(timeout);
                        }}
                        style={{
                            position: 'absolute',
                            top: `230px`,
                            left: `${left}px`,
                            width: '260px',
                            background: 'var(--card-bg)',
                            color: 'var(--fg-color)',
                            borderRadius: '0px',
                            padding: '16px',
                            boxShadow: 'var(--shadow-paper)',
                            border: '1px solid var(--border-color)',
                            zIndex: 99999,
                            pointerEvents: 'auto',
                            fontFamily: 'var(--font-mono)',
                            boxSizing: 'border-box'
                        }}>
                        {isNumeric ? (
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                    Статистика: {colLabel}
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '12px' }}>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '6px 0', color: 'var(--muted-fg)' }}>Среднее</td>
                                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: 'var(--fg-color)' }}>
                                                {colKey === 'duration_ms' ? formatDurationStats(stats.mean) : stats.mean}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '6px 0', color: 'var(--muted-fg)' }}>Медиана</td>
                                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: 'var(--fg-color)' }}>
                                                {colKey === 'duration_ms' ? formatDurationStats(stats.median) : stats.median}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '6px 0', color: 'var(--muted-fg)' }}>Станд. откл.</td>
                                            <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: 'var(--fg-color)' }}>
                                                {colKey === 'duration_ms' ? formatDurationStats(stats.std) : stats.std}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--muted-fg)', marginBottom: '6px', fontWeight: 500 }}>
                                        Распределение частот:
                                    </div>
                                    {stats.distribution && stats.distribution.length > 0 ? (() => {
                                        const counts = stats.distribution.map((d: any) => d.count);
                                        const maxCount = Math.max(...counts, 1);
                                        const svgWidth = 228; // 260px - 32px padding
                                        const svgHeight = 60;
                                        const barWidth = Math.floor(svgWidth / stats.distribution.length) - 2;

                                        return (
                                            <div>
                                                <svg width={svgWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
                                                    {stats.distribution.map((d: any, idx: number) => {
                                                        const barHeight = (d.count / maxCount) * svgHeight;
                                                        const x = idx * (barWidth + 2);
                                                        const y = svgHeight - barHeight;
                                                        return (
                                                            <rect
                                                                key={idx}
                                                                x={x}
                                                                y={y}
                                                                width={barWidth}
                                                                height={barHeight}
                                                                fill="url(#accentGradient)"
                                                                rx="0"
                                                            />
                                                        );
                                                    })}
                                                    <defs>
                                                        <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="var(--primary-color)" />
                                                            <stop offset="100%" stopColor="var(--accent-color)" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--muted-fg)', marginTop: '4px' }}>
                                                    <span>{colKey === 'duration_ms' ? formatDurationStats(stats.distribution[0]?.bin_start) : stats.distribution[0]?.bin_start}</span>
                                                    <span>{colKey === 'duration_ms' ? formatDurationStats(stats.distribution[stats.distribution.length - 1]?.bin_end) : stats.distribution[stats.distribution.length - 1]?.bin_end}</span>
                                                </div>
                                            </div>
                                        );
                                    })() : (
                                        <div style={{ fontSize: '11px', color: 'var(--muted-fg)', textAlign: 'center' }}>Нет данных</div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                                    Анализ категорий: {colLabel}
                                </div>
                                {stats && stats.length > 0 ? (() => {
                                    const counts = stats.map((c: any) => c.count);
                                    const maxCount = Math.max(...counts, 1);

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {stats.slice(0, 5).map((item: any, idx: number) => {
                                                const percentage = (item.count / maxCount) * 100;
                                                return (
                                                    <div key={idx} style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: '0px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: `${percentage}%`,
                                                            background: 'var(--primary-soft)',
                                                            borderRadius: '0px',
                                                            zIndex: 1
                                                        }} />

                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            fontSize: '11px',
                                                            zIndex: 2,
                                                            position: 'relative'
                                                        }}>
                                                            <span style={{ color: 'var(--fg-color)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={item.name}>
                                                                {item.name}
                                                            </span>
                                                            <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                                                                {item.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {stats.length > 5 && (
                                                <div style={{ fontSize: '10px', color: 'var(--muted-fg)', textAlign: 'center', marginTop: '4px' }}>
                                                    + ещё {stats.length - 5} вариантов
                                                </div>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    <div style={{ fontSize: '11px', color: 'var(--muted-fg)', textAlign: 'center' }}>Нет данных</div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}
        </>
    );
};
